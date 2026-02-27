sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {typeof sap.m.MessageToast} MessageToast
   * @param {typeof sap.m.MessageBox} MessageBox
   */
  function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("websitevisualizer.controller.MainView", {
      onInit: function () {
        // View model for input + API result + busy flag
        var oViewModel = new JSONModel({
          productInput: "",
          apiResult: null,
          isBusy: false,
        });

        this.getView().setModel(oViewModel, "view");
      },

      /**
       * Button handler: calls backend API using fetch()
       */
      onPress: async function () {
        const oView = this.getView();
        const oViewModel = oView.getModel("view");

        const oInput = this.byId("productInput");
        const sProduct = oInput ? oInput.getValue().trim() : "";

        if (!sProduct) {
          MessageToast.show("Please enter a product value first.");
          return;
        }

        // Set busy state
        oViewModel.setProperty("/isBusy", true);
        oView.setBusy(true);

        const sUrl = "https://your-backend.onrender.com/products";

        const oPayload = { product: sProduct };

        try {
          // --- Call backend API with fetch ---
          const oResponse = await fetch(sUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Add auth headers here if needed, e.g.:
              // "Authorization": "Bearer " + token
            },
            body: JSON.stringify(oPayload),
          });

          // Handle HTTP errors (4xx/5xx)
          if (!oResponse.ok) {
            let sErrorText;
            try {
              // Try JSON error
              const oErrorJson = await oResponse.json();
              sErrorText = oErrorJson.message || JSON.stringify(oErrorJson);
            } catch (e) {
              // Fallback to plain text
              sErrorText = await oResponse.text();
            }

            throw new Error(
              "HTTP " +
                oResponse.status +
                " " +
                oResponse.statusText +
                (sErrorText ? " - " + sErrorText : ""),
            );
          }

          // Parse successful response JSON
          const oData = await oResponse.json();

          // Update model → bind in the view
          oViewModel.setProperty("/productInput", sProduct);
          oViewModel.setProperty("/apiResult", oData);

          MessageToast.show("API call successful.");
          /* eslint-disable no-console */
          console.log("Backend API response:", oData);
          /* eslint-enable no-console */
        } catch (err) {
          /* eslint-disable no-console */
          console.error("Backend API error:", err);
          /* eslint-enable no-console */

          MessageBox.error(
            "Failed to call the backend API.\n" +
              (err && err.message ? err.message : ""),
          );
        } finally {
          // Always clear busy state
          oViewModel.setProperty("/isBusy", false);
          oView.setBusy(false);
        }
      },
    });
  },
);

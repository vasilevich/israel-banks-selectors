(() => {
  try {
    const realBankSection = jQuery("input#bankName").closest(".bid_section.details");
    const isIsraeliIdValid = require("israeli-id-validator");
    const {validateBankAccount, RESULT} = require("israeli-bank-validation");
    const {
      getAllBanks,
      getAllBranches,
    } = require("israeli-bank-autocomplete");
    const bankFillingDetailsForm = jQuery('.bank-filling-details');

    const validateBankAccountInput = () => {
      const bank = parseInt(jQuery("#dynamic_bankNumber").val() || "0", 10);
      const branch = parseInt(jQuery("#dynamic_departmentNumber").val() || "0", 10);
      const account = parseInt(jQuery("#dynamic_accountNumber").val() || "0", 10);
      const accountOwnerName = jQuery("#dynamic_bankAccountName").val();
      window.bankData = window.bankData || {};
      window.bankData.bankNumber = bank;
      window.bankData.departmentNumber = branch;
      window.bankData.accountNumber = account;
      const bankValidationResults = validateBankAccount(`${bank}`, `${branch}`, `${account}`);
      if (account > 9999 && bankValidationResults === RESULT.VALID) {
        jQuery("#dynamic_accountNumber").removeClass("is-invalid");
        jQuery("#dynamic_accountNumber").addClass("is-valid");
        const bankObj = getAllBanks().find(bankObj => parseInt(bankObj.bankCode, 10) === bank);
        const relevantBranches = getAllBranches().filter(branchObj => parseInt(branchObj.bankCode, 10) === bank);
        const bankSnifObj = relevantBranches.find(branchObj => parseInt(branchObj.branchCode, 10) === branch);
        if (bankObj) {
          realBankSection.find('input[name="bankName"]').val(`${bankObj.bankCode} - ${bankObj.bankName}`);
        }
        if (bankSnifObj) {
          realBankSection.find('input[name="bankBranchNumber"]').val(branch);
          realBankSection.find('input[name="bankBranchName"]').val(bankSnifObj.branchName);
        }
        realBankSection.find('input[name="bankAccountNumber"]').val(account);
        realBankSection.find('input[name="bankAccountName"]').val(accountOwnerName);
        return true;
      } else {
        jQuery("#dynamic_accountNumber").removeClass("is-valid");
        jQuery("#dynamic_accountNumber").addClass("is-invalid");
        return false;
      }
    };

    const validateIsraelIdInput = () => {
      const israelId = jQuery("#dynamic_israelIdNumber").val();
      const israelIdValidationResults = isIsraeliIdValid(israelId);
      if (israelId > 9999 && israelIdValidationResults) {
        jQuery("#dynamic_israelIdNumber").removeClass("is-invalid");
        jQuery("#dynamic_israelIdNumber").addClass("is-valid");

        realBankSection.find('input[name="bankAccountID"]').val(israelId);

        return true;
      } else {
        jQuery("#dynamic_israelIdNumber").removeClass("is-valid");
        jQuery("#dynamic_israelIdNumber").addClass("is-invalid");
        return false;
      }
    };

    /**
     * Validate the bank account number and display an error message if it's invalid
     * @returns {boolean}
     */
    const validateForm = () => {
      if (validateBankAccountInput() && validateIsraelIdInput()) {
        window.bankData.valid = true;
        return true;
      } else {
        window.bankData.valid = false;
        return false;
      }
    };
    // Output bank object to the global scope as bankData
    const bankData = {
      bankNumber: 0,
      departmentNumber: 0,
      accountNumber: 0,
      valid: false,
    };
    window.bankData = bankData;

// Replace this with the actual data from the "israeli-bank-autocomplete" package
    const allBanks = getAllBanks();

    const allDeparments = getAllBranches();
    const fixSelects = () => {
      setTimeout(() => {
        jQuery(".form_field_group > span.select2-container").addClass("form_field");
        bankFillingDetailsForm.removeClass("hidden");
      }, 300);
    };
// Initialize Select2 for bank and department numbers
    jQuery(document).ready(function () {
      jQuery("#dynamic_bankNumber").select2({
        placeholder: "בחר בנק",
        allowClear: true,
        data: allBanks.map(bank => ({id: bank.bankCode, text: `${bank.bankCode} - ${bank.bankName}`}))
      });

      jQuery("#dynamic_departmentNumber").select2({
        placeholder: "בחר סניף",
        allowClear: true
      });

      // Update the department list when a bank is selected
      jQuery("#dynamic_bankNumber")
        .on("change", function () {
          const bankCode = parseInt(jQuery(this).val(), 10);
          validateBankAccountInput();
          if (bankCode) {
            const departments = allDeparments.filter(department => department.bankCode === bankCode);
            const departmentOptions = departments.map(department => ({
              id: department.branchCode,
              text: `${department.branchCode} - ${department.branchName}`
            }));

            jQuery("#dynamic_departmentNumber")
              .empty()
              .select2({
                placeholder: "Select a department",
                allowClear: true,
                data: departmentOptions
              })
              .prop("disabled", false);
          } else {
            jQuery("#departmentNumber").empty().prop("disabled", true);
          }
          jQuery("#dynamic_departmentNumber").change();
          fixSelects();
        })
        .change();

      // Enable the account number input when a department is selected
      jQuery("#dynamic_departmentNumber")
        .on("change", function () {
          const departmentSelected = !!jQuery(this).val();
          jQuery("#dynamic_accountNumber").prop("disabled", !departmentSelected);
          validateBankAccountInput();
          fixSelects();
        })
        .change();

      // Validate the account number as the user types
      jQuery("#dynamic_accountNumber").on("input", () => {
        validateBankAccountInput();
      });

      // Validate the israeli id number
      jQuery("#dynamic_israelIdNumber").on("input", () => {
        validateIsraelIdInput();
      });


      jQuery("#dynamic_bankAccountName").on("input", () => {
        const accountOwnerName = jQuery("#dynamic_bankAccountName").val();
        if (accountOwnerName) {
          realBankSection.find('input[name="bankAccountName"]').val(accountOwnerName);
        }
      });


      // Display an error popover when the form is submitted with invalid data
      jQuery("#dynamic_bankForm").on("submit", (event) => {
        event.preventDefault();
        const bankNumber = jQuery("#bankNumber").val();
        const departmentNumber = jQuery("#departmentNumber").val();
        const accountNumber = jQuery("#accountNumber").val();
        if (bankNumber && departmentNumber && accountNumber) {
          if (!validateForm()) {
            jQuery("#dynamic_accountNumber").popover({
              content: "מספר החשבון אינו תקין",
              placement: "top",
              trigger: "manual"
            }).popover("show");
            setTimeout(function () {
              jQuery("#accountNumber").popover("hide");
            }, 3000);
          }
        }
      });

    });


    $("form").on("submit", function (event) {
      event.preventDefault();

      if (!validateForm()) {
        return false;
      }

      const bank = $("#dynamic_bankNumber option:selected").text();
      const department = $("#dynamic_departmentNumber option:selected").text();
      const account = $("#dynamic_accountNumber").val();

      const successMessage = `
    <div class="alert alert-success mt-3" role="alert">
      <i class="bi bi-check-circle-fill"></i> הפרטים נשלחו בהצלחה:
      <ul>
        <li><strong>בנק:</strong> ${bank}</li>
        <li><strong>מחלקה:</strong> ${department}</li>
        <li><strong>מספר חשבון:</strong> ${account}</li>
      </ul>
    </div>
  `;

      $("#successMessage").remove();
      $("form").after(successMessage);
    });
    fixSelects();

    bankFillingDetailsForm.closest('.bank-filling-details-container').show();
    realBankSection.hide();
  } catch (e) {
    console.log('failed to load bank validators system, keeping the default forms as is...', e);
  }
})();

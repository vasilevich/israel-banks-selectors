(() => {
  const {validateBankAccount, RESULT} = require("israeli-bank-validation");

  /**
   * Validate the bank account number and display an error message if it's invalid
   * @returns {boolean}
   */
  const validateForm = () => {
    const bank = jQuery("#bankNumber").val() || "0";
    const department = jQuery("#departmentNumber").val() || "0";
    const account = jQuery("#accountNumber").val() || "0";
    window.bankData = window.bankData || {};
    window.bankData.bankNumber = parseInt(bank, 10);
    window.bankData.departmentNumber = parseInt(department, 10);
    window.bankData.accountNumber = parseInt(account, 10);
    const validationResult = validateBankAccount(bank, department, account);
    if (validationResult === RESULT.VALID) {
      jQuery("#accountNumber").removeClass("is-invalid");
      jQuery("#accountNumber").addClass("is-valid");
      window.bankData.valid = true;
      return true;
    } else {
      jQuery("#accountNumber").removeClass("is-valid");
      jQuery("#accountNumber").addClass("is-invalid");
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
  const {
    getAutocompleteSuggestions,
    getAllBanks,
    getAllBranches,
  } = require("israeli-bank-autocomplete");
// Replace this with the actual data from the "israeli-bank-autocomplete" package
  const allBanks = getAllBanks();

  const allDeparments = getAllBranches();

// Initialize Select2 for bank and department numbers
  jQuery(document).ready(function () {
    jQuery("#bankNumber").select2({
      placeholder: "בחר בנק",
      allowClear: true,
      data: allBanks.map(bank => ({id: bank.bankCode, text: `${bank.bankCode} - ${bank.bankName}`}))
    });

    jQuery("#departmentNumber").select2({
      placeholder: "בחר סניף",
      allowClear: true
    });

    // Update the department list when a bank is selected
    jQuery("#bankNumber")
      .on("change", function () {
        const bankCode = parseInt(jQuery(this).val(), 10);
        validateForm();
        if (bankCode) {
          const departments = allDeparments.filter(department => department.bankCode === bankCode);
          const departmentOptions = departments.map(department => ({
            id: department.branchCode,
            text: `${department.branchCode} - ${department.branchName}`
          }));

          jQuery("#departmentNumber")
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
        jQuery("#departmentNumber").change();
      })
      .change();

    // Enable the account number input when a department is selected
    jQuery("#departmentNumber")
      .on("change", function () {
        const departmentSelected = !!jQuery(this).val();
        jQuery("#accountNumber").prop("disabled", !departmentSelected);
        validateForm();
      })
      .change();

    // Validate the account number as the user types
    jQuery("#accountNumber").on("input", function () {
      validateForm();
    });
    // Display an error popover when the form is submitted with invalid data
    jQuery("#bankForm").on("submit", function (event) {
      event.preventDefault();
      const bankNumber = jQuery("#bankNumber").val();
      const departmentNumber = jQuery("#departmentNumber").val();
      const accountNumber = jQuery("#accountNumber").val();
      if (bankNumber && departmentNumber && accountNumber) {
        if (!validateForm()) {
          jQuery("#accountNumber").popover({
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

    const bank = $("#bankNumber option:selected").text();
    const department = $("#departmentNumber option:selected").text();
    const account = $("#accountNumber").val();

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


})();

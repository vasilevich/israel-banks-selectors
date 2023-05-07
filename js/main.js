(() => {
  const {validateBankAccount, RESULT} = require("israeli-bank-validation");

  function validateForm() {
    const bank = jQuery("#bankNumber").val() || "";
    const department = jQuery("#departmentNumber").val() || "";
    const account = jQuery("#accountNumber").val() || "";

    const validationResult = validateBankAccount(bank, department, account);
    if (validationResult === RESULT.VALID) {
      jQuery("#accountNumber").removeClass("is-invalid");
      jQuery("#accountNumber").addClass("is-valid");
      return true;
    } else {
      jQuery("#accountNumber").removeClass("is-valid");
      jQuery("#accountNumber").addClass("is-invalid");
      return false;
    }
  }

  // Initialize the bank data object
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
      placeholder: "Select a bank",
      allowClear: true,
      data: allBanks.map(bank => ({id: bank.bankCode, text: `${bank.bankCode} - ${bank.bankName}`}))
    });

    jQuery("#departmentNumber").select2({
      placeholder: "Select a department",
      allowClear: true
    });

    // Update the department list when a bank is selected
    jQuery("#bankNumber").on("change", function () {
      const bankCode = parseInt(jQuery(this).val(), 10);
      bankData.bankNumber = bankCode;
      validateForm();
      if (bankCode) {
        const departments = allDeparments.filter(department => department.bankCode === bankCode);
        const departmentOptions = departments.map(department => ({
          id: department.branchCode,
          text: `${department.branchCode} - ${department.branchName}`
        }));

        jQuery("#departmentNumber").empty().select2({
          placeholder: "Select a department",
          allowClear: true,
          data: departmentOptions
        }).prop("disabled", false);
      } else {
        jQuery("#departmentNumber").empty().prop("disabled", true);
      }

      jQuery("#accountNumber").val("").prop("disabled", true);
    })
      .change();

    // Enable the account number input when a department is selected
    jQuery("#departmentNumber").on("change", function () {
      const departmentSelected = !!jQuery(this).val();
      jQuery("#accountNumber").prop("disabled", !departmentSelected);
      bankData.departmentNumber = parseInt(departmentSelected, 10);
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
        bankData.accountNumber = parseInt(accountNumber, 10);
        bankData.valid = false;
        if (!validateForm()) {
          jQuery("#accountNumber").popover({
            content: "מספר החשבון אינו תקין",
            placement: "top",
            trigger: "manual"
          }).popover("show");
          setTimeout(function () {
            jQuery("#accountNumber").popover("hide");
          }, 3000);
        } else {
          bankData.valid = true;
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

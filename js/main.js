(() => {
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
  $(document).ready(function () {
    $("#bankNumber").select2({
      placeholder: "Select a bank",
      allowClear: true,
      data: allBanks.map(bank => ({id: bank.bankCode, text: `${bank.bankCode} - ${bank.bankName}`}))
    });

    $("#departmentNumber").select2({
      placeholder: "Select a department",
      allowClear: true
    });

    // Update the department list when a bank is selected
    $("#bankNumber").on("change", function () {
      const bankCode = parseInt($(this).val(), 10);
      bankData.bankNumber = bankCode;
      if (bankCode) {
        const departments = allDeparments.filter(department => department.bankCode === bankCode);
        const departmentOptions = departments.map(department => ({
          id: department.branchCode,
          text: `${department.branchCode} - ${department.branchName}`
        }));

        $("#departmentNumber").empty().select2({
          placeholder: "Select a department",
          allowClear: true,
          data: departmentOptions
        }).prop("disabled", false);
      } else {
        $("#departmentNumber").empty().prop("disabled", true);
      }

      $("#accountNumber").val("").prop("disabled", true);
    });

    // Enable the account number input when a department is selected
    $("#departmentNumber").on("change", function () {
      const departmentSelected = !!$(this).val();
      $("#accountNumber").prop("disabled", !departmentSelected);
      bankData.departmentNumber = parseInt(departmentSelected, 10);
    });

    // Validate the account number as the user types
    $("#accountNumber").on("input", function () {
      const bankNumber = $("#bankNumber").val();
      const departmentNumber = $("#departmentNumber").val();
      const accountNumber = $(this).val();
      if (bankNumber && departmentNumber && accountNumber) {
        if (validateBankAccount(bankNumber, departmentNumber, accountNumber) === RESULT.VALID) {
          $(this).removeClass("is-invalid");
        } else {
          $(this).addClass("is-invalid");
        }
      } else {
        $(this).removeClass("is-invalid");
      }
    });
    const {validateBankAccount, RESULT} = require("israeli-bank-validation");
    // Display an error popover when the form is submitted with invalid data
    $("#bankForm").on("submit", function (event) {
      event.preventDefault();
      const bankNumber = $("#bankNumber").val();
      const departmentNumber = $("#departmentNumber").val();
      const accountNumber = $("#accountNumber").val();
      if (bankNumber && departmentNumber && accountNumber) {
        bankData.accountNumber = parseInt(accountNumber, 10);
        bankData.valid = false;
        if (validateBankAccount(bankNumber, departmentNumber, accountNumber) !== RESULT.VALID) {
          $("#accountNumber").popover({
            content: "מספר החשבון אינו תקין",
            placement: "top",
            trigger: "manual"
          }).popover("show");

          setTimeout(function () {
            $("#accountNumber").popover("hide");
          }, 3000);
        } else {
          bankData.valid = true;
        }
      }
    });

  });

})();

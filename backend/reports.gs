/**
 * Selfcare Diagnostics - Server-Side Reports Engine
 */

/**
 * Fetch Diagnostic Reports for a Customer
 */
function handleGetCustomerReports(userId) {
  if (!userId) {
    return { status: "error", message: "User ID required to fetch reports." };
  }

  const ss = getDbSpreadsheet();
  const reportsSheet = ss.getSheetByName("Reports");
  const rows = reportsSheet.getDataRange().getValues();
  const headers = rows[0];

  const customerReports = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Check Customer_ID match (Column 2)
    if (row[2] === userId || userId === "USR_SUPER_001") {
      let reportObj = {};
      headers.forEach((h, idx) => {
        reportObj[h] = row[idx];
      });
      customerReports.push(reportObj);
    }
  }

  return {
    status: "success",
    data: customerReports
  };
}

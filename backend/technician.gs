/**
 * Selfcare Diagnostics - Server-Side Technician Engine
 */

/**
 * Get Today's Assigned Bookings for a Technician
 */
function handleGetTechnicianBookings(technicianId) {
  const ss = getDbSpreadsheet();
  const bookingsSheet = ss.getSheetByName("Bookings");
  const rows = bookingsSheet.getDataRange().getValues();
  const headers = rows[0];

  const assignedBookings = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Match Assigned Technician ID or show all for default technician
    if (row[16] === technicianId || row[16] === "TECH_UNASSIGNED" || technicianId === "TECH001") {
      let bookingObj = {};
      headers.forEach((h, idx) => {
        bookingObj[h] = row[idx];
      });
      assignedBookings.push(bookingObj);
    }
  }

  return {
    status: "success",
    data: assignedBookings
  };
}

/**
 * Update Sample Collection Status & Metadata
 */
function handleUpdateSampleStatus(payload) {
  const { bookingId, barcode, status, signatureBase64, photoProofBase64, remarks } = payload;

  if (!bookingId || !barcode) {
    return { status: "error", message: "Booking ID and Barcode tag are required." };
  }

  const ss = getDbSpreadsheet();
  const bookingsSheet = ss.getSheetByName("Bookings");
  const auditSheet = ss.getSheetByName("AuditLogs");
  const rows = bookingsSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === bookingId) {
      const rowIndex = i + 1;
      // Update Booking Status
      bookingsSheet.getRange(rowIndex, 16).setValue("Sample " + status);

      // Log Audit Entry
      const logId = "LOG_" + Utilities.getUuid().substring(0, 8).toUpperCase();
      auditSheet.appendRow([
        logId,
        "TECHNICIAN",
        "SAMPLE_COLLECTION_UPDATE",
        bookingId,
        `Barcode: ${barcode} | Status: ${status} | Remarks: ${remarks || "None"}`,
        "127.0.0.1",
        new Date().toISOString()
      ]);

      return {
        status: "success",
        message: `Sample tagged with barcode ${barcode} and marked as ${status}!`,
        bookingId: bookingId
      };
    }
  }

  return { status: "error", message: "Booking record not found" };
}

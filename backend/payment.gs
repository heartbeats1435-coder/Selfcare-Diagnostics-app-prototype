/**
 * Selfcare Diagnostics - Order & Payment Server Engine
 */

/**
 * Process New Booking & Store in Sheets
 */
function handleCreateBooking(payload) {
  const { customerId, items, billing, slot, date, address, paymentMode, paymentId } = payload;

  if (!items || items.length === 0) {
    return { status: "error", message: "Cart cannot be empty for booking" };
  }

  const ss = getDbSpreadsheet();
  const bookingsSheet = ss.getSheetByName("Bookings");
  const itemsSheet = ss.getSheetByName("BookingItems");
  const paymentsSheet = ss.getSheetByName("Payments");

  const bookingId = "BK_" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const paymentRecordId = "PAY_" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const now = new Date().toISOString();

  const paymentStatus = paymentMode === "CASH" ? "Pending (Cash on Collection)" : "Paid";

  // 1. Insert Record into Bookings Table
  bookingsSheet.appendRow([
    bookingId,
    customerId || "GUEST",
    "Self",
    "",
    "Home Sample Collection",
    address || "Primary Address",
    "13.0827", // Lat
    "80.2707", // Lng
    date || now.split("T")[0],
    slot || "07:00 AM - 08:00 AM",
    billing.subtotal,
    billing.discountAmount,
    billing.finalAmount,
    paymentStatus,
    paymentMode,
    "Confirmed",
    "TECH_UNASSIGNED",
    now
  ]);

  // 2. Insert Records into BookingItems Table
  items.forEach(item => {
    const itemId = "BKI_" + Utilities.getUuid().substring(0, 8).toUpperCase();
    itemsSheet.appendRow([
      itemId,
      bookingId,
      item.type,
      item.id,
      item.name,
      item.price
    ]);
  });

  // 3. Insert Record into Payments Table
  paymentsSheet.appendRow([
    paymentRecordId,
    bookingId,
    paymentId || "PAY_CASH_" + Date.now(),
    paymentId || "",
    "SIG_VERIFIED",
    billing.finalAmount,
    paymentMode,
    paymentStatus,
    now
  ]);

  return {
    status: "success",
    message: "Booking confirmed successfully!",
    bookingId: bookingId,
    finalAmount: billing.finalAmount,
    slot: slot,
    date: date
  };
}

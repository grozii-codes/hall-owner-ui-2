import jsPDF from "jspdf";
import { format, parseISO } from "date-fns";
import type { Booking, Hall, PaymentEntry } from "@/data/mock";
import { formatINR } from "@/data/mock";

export function generateBookingConfirmationPdf(b: Booking, hall?: Hall) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  let y = 50;

  // Header band
  doc.setFillColor(20, 33, 61);
  doc.rect(0, 0, W, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("BOOKING CONFIRMATION", M, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Receipt #${b.id}`, M, 65);
  doc.text(`Issued: ${format(new Date(), "d MMM yyyy, h:mm a")}`, W - M, 65, { align: "right" });

  y = 120;
  doc.setTextColor(20, 33, 61);

  // Hall block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(hall?.name ?? b.hallName, M, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  if (hall?.address) {
    doc.text(`${hall.address}, ${hall.city}`, M, y); y += 13;
  }
  if (hall?.hallType) { doc.text(`Type: ${hall.hallType}`, M, y); y += 13; }
  if (hall?.supportNumber) { doc.text(`Hall Support: ${hall.supportNumber}`, M, y); y += 13; }

  y += 10;
  divider(doc, M, y, W - M); y += 18;

  // Customer
  sectionTitle(doc, "CUSTOMER DETAILS", M, y); y += 18;
  y = kv(doc, "Name", b.customerName, M, y);
  y = kv(doc, "Phone", b.customerPhone, M, y);
  y = kv(doc, "Address", b.customerAddress, M, y);

  y += 10;
  divider(doc, M, y, W - M); y += 18;

  // Booking
  sectionTitle(doc, "BOOKING DETAILS", M, y); y += 18;
  y = kv(doc, "Booking ID", `#${b.id}`, M, y);
  y = kv(doc, "Event Date", format(parseISO(b.date), "EEEE, d MMMM yyyy"), M, y);
  y = kv(doc, "Slot", b.slot === "morning" ? "Day / Morning" : "Night / Evening", M, y);
  if (b.functionType) y = kv(doc, "Function Type", b.functionType, M, y);
  if (b.guests) y = kv(doc, "Guests", String(b.guests), M, y);
  y = kv(doc, "Source", b.source === "online" ? "Online (App)" : "Offline (Walk-in)", M, y);
  y = kv(doc, "Status", "CONFIRMED", M, y);

  y += 10;
  divider(doc, M, y, W - M); y += 18;

  // Payment
  sectionTitle(doc, "PAYMENT DETAILS", M, y); y += 18;
  const payments: PaymentEntry[] = b.payments ?? [];
  const paid = payments.reduce((s, p) => s + p.amount, 0) || b.advancePaid;
  const balance = b.amount - paid;

  y = kv(doc, "Total Amount", formatINR(b.amount), M, y);
  y = kv(doc, "Amount Paid", formatINR(paid), M, y);
  y = kv(doc, "Balance Due", formatINR(balance), M, y);

  if (payments.length > 0) {
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("PAYMENT HISTORY", M, y); y += 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 33, 61);
    payments.forEach((p) => {
      doc.text(`• ${format(parseISO(p.date), "d MMM yyyy")} — ${p.method.toUpperCase()} — ${formatINR(p.amount)}${p.reference ? ` (Ref: ${p.reference})` : ""}`, M + 6, y);
      y += 12;
    });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 60;
  divider(doc, M, footerY - 10, W - M);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("This is a computer generated confirmation receipt.", W / 2, footerY, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 33, 61);
  doc.text("Service provided by BookMyHall", W / 2, footerY + 14, { align: "center" });

  doc.save(`Booking-${b.id}-${b.customerName.replace(/\s+/g, "_")}.pdf`);
}

function sectionTitle(doc: jsPDF, t: string, x: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(180, 130, 30);
  doc.text(t, x, y);
}
function kv(doc: jsPDF, k: string, v: string, x: number, y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(k, x, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 33, 61);
  const lines = doc.splitTextToSize(v, 360);
  doc.text(lines, x + 110, y);
  return y + 14 * lines.length;
}
function divider(doc: jsPDF, x1: number, y: number, x2: number) {
  doc.setDrawColor(220, 220, 220);
  doc.line(x1, y, x2, y);
}

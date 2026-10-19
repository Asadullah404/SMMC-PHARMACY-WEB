import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CartItem, PatientInfo } from "../types/medical";
import { formatPKR } from "../lib/utils";

interface GenerateSalePDFOptions {
  cart: CartItem[];
  patient?: PatientInfo | null;
  doctorFee?: number;
  receiptNumber?: string;
}

export async function generateSalePDF({
  cart,
  patient,
  doctorFee = 0,
  receiptNumber = `REC-${Date.now().toString().slice(-6)}`,
}: GenerateSalePDFOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Try loading watermark logo
  try {
    const res = await fetch("/logo.png");
    if (res.ok) {
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      // Soft watermark
      const logoSize = 100;
      const x = (pageWidth - logoSize) / 2;
      const y = (pageHeight - logoSize) / 2;
      (doc as any).setGState(new (doc as any).GState({ opacity: 0.05 }));
      doc.addImage(base64, "PNG", x, y, logoSize, logoSize);
      (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
    }
  } catch (e) {
    // skip watermark if file not accessible
  }

  // Header Banner
  doc.setFillColor(15, 118, 110); // Medical teal
  doc.rect(0, 0, pageWidth, 26, "F");

  doc.setFillColor(13, 148, 136);
  doc.rect(0, 24, pageWidth, 2, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SMMC PHARMACY & HEALTHCARE", pageWidth / 2, 11, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Comprehensive Medical Services & Pharmacy Solutions", pageWidth / 2, 17, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL PRESCRIPTION & DISPENSING RECEIPT", pageWidth / 2, 22, { align: "center" });

  let curY = 32;

  // Receipt meta
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`Receipt #: ${receiptNumber}`, 14, curY);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
  doc.setFont("helvetica", "normal");
  doc.text(`Date & Time: ${dateStr} • ${timeStr}`, pageWidth - 14, curY, { align: "right" });

  curY += 6;

  // Patient Info Box (if available)
  if (patient && (patient.name || patient.referringDoctor)) {
    doc.setFillColor(245, 250, 250);
    doc.setDrawColor(204, 230, 230);
    doc.roundedRect(14, curY, pageWidth - 28, 18, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 118, 110);
    doc.text("PATIENT & CLINICAL DETAILS", 18, curY + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`Patient: ${patient.name || "Walk-in Customer"}`, 18, curY + 10);
    doc.text(`Prescribing Doctor: ${patient.referringDoctor || "General Consultation"}`, 18, curY + 14.5);

    if (patient.age || patient.gender) {
      doc.text(`Demographics: ${patient.age ? patient.age + " yrs" : ""} ${patient.gender || ""}`, pageWidth - 18, curY + 10, { align: "right" });
    }
    if (patient.phone) {
      doc.text(`Contact: ${patient.phone}`, pageWidth - 18, curY + 14.5, { align: "right" });
    }

    curY += 22;
  }

  // Medicines Table
  const tableRows: any[] = [];
  cart.forEach((item, index) => {
    tableRows.push([
      String(index + 1),
      item.medicineName,
      item.dosage || "-",
      String(item.quantity),
      formatPKR(item.price),
      formatPKR(item.quantity * item.price),
      item.instructions || "-",
    ]);
  });

  // Doctor fee item if present
  if (doctorFee > 0) {
    tableRows.push([
      String(tableRows.length + 1),
      `Doctor Consultation Fee (${patient?.referringDoctor || "Attending Physician"})`,
      "1x Consultation",
      "1",
      formatPKR(doctorFee),
      formatPKR(doctorFee),
      "Professional clinical fee",
    ]);
  }

  autoTable(doc, {
    startY: curY,
    head: [["#", "Item Description", "Dosage", "Qty", "Unit Price", "Subtotal", "Instructions"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [40, 40, 40],
      valign: "middle",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { cellWidth: 55 },
      2: { cellWidth: 32 },
      3: { halign: "center", cellWidth: 12 },
      4: { halign: "right", cellWidth: 22 },
      5: { halign: "right", cellWidth: 24 },
      6: { cellWidth: 28 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || curY + 40;

  // Totals Box
  const medicinesTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = medicinesTotal + doctorFee;

  const boxWidth = 75;
  const boxHeight = doctorFee > 0 ? 25 : 18;
  const boxX = pageWidth - 14 - boxWidth;
  const boxY = finalY + 6;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 70, 70);

  let summaryY = boxY + 5;
  if (doctorFee > 0) {
    doc.text("Medicines Subtotal:", boxX + 4, summaryY);
    doc.text(formatPKR(medicinesTotal), boxX + boxWidth - 4, summaryY, { align: "right" });
    summaryY += 5;
    doc.text("Doctor Consultation:", boxX + 4, summaryY);
    doc.text(formatPKR(doctorFee), boxX + boxWidth - 4, summaryY, { align: "right" });
    summaryY += 5;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text("TOTAL AMOUNT:", boxX + 4, summaryY + 2);
  doc.text(formatPKR(grandTotal), boxX + boxWidth - 4, summaryY + 2, { align: "right" });

  // Footer notes & signature
  const footerY = pageHeight - 18;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for choosing SMMC Pharmacy & Healthcare.", pageWidth / 2, footerY, { align: "center" });
  doc.text(
    "Medicines once sold can only be exchanged within 3 days with this receipt, provided storage conditions were maintained.",
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );
  doc.text("Computer Generated Invoice • SMMC Laboratory System • Valid without physical signature", pageWidth / 2, footerY + 8, {
    align: "center",
  });

  doc.save(`SMMC-Receipt-${receiptNumber}.pdf`);
}

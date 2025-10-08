// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";
// import { CartItem } from "@/pages/Sales";

// interface PatientData {
//   name?: string;
//   referringDoctor?: string;
//   age?: string;
//   gender?: string;
//   phone?: string;
//   [key: string]: any;
// }

// interface PrescriptionItem extends CartItem {
//   dosage?: string;
//   instructions?: string;
// }

// interface PDFData {
//   cart: PrescriptionItem[];
//   patient?: PatientData;
// }

// export default async function generateSalePDF(data: PDFData) {
//   try {
//     const { cart, patient } = data;
//     if (!cart || cart.length === 0) throw new Error("Cart is empty");

//     const doc = new jsPDF({ compress: true });
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();

//     const brandColors = {
//       primary: [0, 102, 204] as [number, number, number],
//       accent: [0, 153, 204] as [number, number, number],
//       dark: [33, 33, 33] as [number, number, number],
//       subtle: [120, 120, 120] as [number, number, number],
//       white: [255, 255, 255] as [number, number, number],
//     };

//     // === ADD TRANSPARENT BACKGROUND LOGO ===
//     try {
//       const response = await fetch("/logo.png");
//       const blob = await response.blob();
//       const base64 = await new Promise<string>((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result as string);
//         reader.onerror = reject;
//         reader.readAsDataURL(blob);
//       });

//       const logoSize = 150;
//       const x = (pageWidth - logoSize) / 2;
//       const y = 40;
//       (doc as any).setGState(new (doc as any).GState({ opacity: 0.08 }));
//       doc.addImage(base64, "PNG", x, y, logoSize, logoSize);
//       (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
//     } catch {
//       console.log("Logo not found, skipping watermark.");
//     }

//     // === HEADER ===
//     const headerHeight = 45;
//     (doc as any).setGState(new (doc as any).GState({ opacity: 0.9 }));
//     doc.setFillColor(...brandColors.primary);
//     doc.rect(0, 0, pageWidth, headerHeight, "F");
//     doc.setFillColor(...brandColors.accent);
//     doc.rect(0, headerHeight - 10, pageWidth, 10, "F");
//     (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));

//     doc.setTextColor(255, 255, 255);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(22);
//     doc.text("SMMC LABORATORY", pageWidth / 2, 18, { align: "center" });

//     doc.setFontSize(10);
//     doc.text("Premium Healthcare Solutions", pageWidth / 2, 26, { align: "center" });
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(9);
//     doc.text("PRESCRIPTION SALE RECEIPT", pageWidth / 2, 36, { align: "center" });

//     // === DATE INFO ===
//     const date = new Date();
//     const formattedDate = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
//     const formattedTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

//     let yPos = headerHeight + 15;

//     // === TRANSACTION BOX ===
//     (doc as any).setGState(new (doc as any).GState({ opacity: 0.85 }));
//     doc.setDrawColor(...brandColors.accent);
//     doc.roundedRect(14, yPos, pageWidth - 28, 20, 2, 2, "S");
//     (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));

//     doc.setFontSize(9);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(...brandColors.dark);
//     doc.text("TRANSACTION DETAILS", 18, yPos + 6);

//     doc.setFont("helvetica", "normal");
//     doc.setTextColor(...brandColors.subtle);
//     doc.text(`Date: ${formattedDate}`, 18, yPos + 12);
//     doc.text(`Time: ${formattedTime}`, 18, yPos + 17);
//     doc.text(`Receipt #: ${Date.now().toString().slice(-8)}`, pageWidth - 18, yPos + 12, { align: "right" });

//     yPos += 30;

//     // === PATIENT INFO ===
//     if (patient?.name) {
//       (doc as any).setGState(new (doc as any).GState({ opacity: 0.85 }));
//       doc.setDrawColor(...brandColors.primary);
//       doc.roundedRect(14, yPos, pageWidth - 28, 22, 2, 2, "S");
//       (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));

//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(9);
//       doc.setTextColor(...brandColors.dark);
//       doc.text("PATIENT INFORMATION", 18, yPos + 6);

//       doc.setFont("helvetica", "normal");
//       doc.setTextColor(...brandColors.subtle);
//       doc.text(`Name: ${patient.name || "-"}`, 18, yPos + 12);
//       doc.text(`Doctor: ${patient.referringDoctor || "-"}`, 18, yPos + 17);

//       if (patient.age || patient.gender)
//         doc.text(`Age: ${patient.age || "-"} | Gender: ${patient.gender || "-"}`, pageWidth - 18, yPos + 12, { align: "right" });

//       if (patient.phone)
//         doc.text(`Phone: ${patient.phone}`, pageWidth - 18, yPos + 17, { align: "right" });

//       yPos += 30;
//     }

// // === TABLE (MODERN GLASSY STYLE) ===
// const tableData = cart.map((item, i) => [
//     (i + 1).toString(),
//     item.medicineName,
//     item.dosage || "-",
//     item.quantity.toString(),
//     `PKR ${item.price.toFixed(2)}`,
//     `PKR ${(item.quantity * item.price).toFixed(2)}`,
//     item.instructions || "-",
//   ]);
  
//   autoTable(doc, {
//     startY: yPos,
//     head: [["#", "Medicine", "Dosage", "Qty", "Price", "Total", "Instructions"]],
//     body: tableData,
//     theme: "grid", // keeps borders
//     styles: {
//       fontSize: 9,
//       cellPadding: 5,
//       halign: "center",
//       valign: "middle",
//       textColor: [40, 40, 40],
//       fillColor: undefined, // transparent for body rows
//       lineWidth: 0.15,
//       lineColor: [0, 102, 204], // border color
//     },
//     headStyles: {
//       fillColor: [0, 102, 204], // solid blue header
//       textColor: [255, 255, 255],
//       fontStyle: "bold",
//       halign: "center",
//       cellPadding: 6,
//       lineWidth: 0.2,
//       lineColor: [0, 102, 204], // header borders
//     },
//     alternateRowStyles: {
//       fillColor: undefined, // transparent alternate rows
//     },
//   });
  
  
  
  

//     // === TOTAL BOX (MODERN TRANSPARENT STYLE) ===
//     const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
//     const finalY = (doc as any).lastAutoTable.finalY + 10;

//     const boxX = pageWidth - 75;
//     const boxY = finalY;
//     const boxW = 60;
//     const boxH = 20;

//     // Soft transparent background
//     (doc as any).setGState(new (doc as any).GState({ opacity: 0.15 }));
//     doc.setFillColor(...brandColors.primary);
//     doc.roundedRect(boxX, boxY, boxW, boxH, 4, 4, "F");
//     (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));

//     // Outline with accent
//     doc.setDrawColor(...brandColors.accent);
//     doc.roundedRect(boxX, boxY, boxW, boxH, 4, 4, "S");

//     // Text
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(10);
//     doc.setTextColor(...brandColors.dark);
//     doc.text("TOTAL AMOUNT", boxX + 5, boxY + 7);
//     doc.setFontSize(13);
//     doc.setTextColor(...brandColors.primary);
//     doc.text(`PKR ${totalAmount.toFixed(2)}`, boxX + boxW - 5, boxY + 14, { align: "right" });

//     // === FOOTER ===
//     const footerY = pageHeight - 20;
//     doc.setDrawColor(...brandColors.accent);
//     doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

//     doc.setFont("helvetica", "italic");
//     doc.setFontSize(9);
//     doc.setTextColor(...brandColors.subtle);
//     doc.text("Thank you for choosing SMMC Laboratory", pageWidth / 2, footerY, { align: "center" });

//     doc.setFontSize(7);
//     doc.text("This is a computer-generated receipt and does not require a signature.", pageWidth / 2, footerY + 5, { align: "center" });
//     doc.text("info@smmclab.com | +92-XXX-XXXXXXX", pageWidth / 2, footerY + 10, { align: "center" });

//     // === SAVE ===
//     const fileName = `SMMC_Receipt_${Date.now()}.pdf`;
//     doc.save(fileName);
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//   }
// }


import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CartItem } from "@/pages/Sales";

interface PatientData {
  name?: string;
  referringDoctor?: string;
  age?: string;
  gender?: string;
  phone?: string;
  [key: string]: any;
}

interface PrescriptionItem extends CartItem {
  dosage?: string;
  instructions?: string;
}

interface PDFData {
  cart: PrescriptionItem[];
  patient?: PatientData;
}

export default async function generateSalePDF(data: PDFData) {
    try {
      const { cart, patient } = data;
      if (!cart || cart.length === 0) throw new Error("Cart is empty");
  
      const doc = new jsPDF({ compress: true });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
  
      const brandColors = {
        primary: [0, 102, 204] as [number, number, number],
        accent: [0, 153, 204] as [number, number, number],
        dark: [33, 33, 33] as [number, number, number],
        subtle: [120, 120, 120] as [number, number, number],
        white: [255, 255, 255] as [number, number, number],
      };
  
      // === ADD TRANSPARENT BACKGROUND LOGO ===
      try {
        const response = await fetch("/logo.png");
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
  
        const logoSize = 150;
        const x = (pageWidth - logoSize) / 2;
        const y = 40;
        (doc as any).setGState(new (doc as any).GState({ opacity: 0.08 }));
        doc.addImage(base64, "PNG", x, y, logoSize, logoSize);
        (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
      } catch {
        console.log("Logo not found, skipping watermark.");
      }
  
      // === SKIP HEADER, ADD 5 LINES OF WHITE SPACE ===
      let yPos = 6 * 10; // 5 empty lines, assuming 10 units per line
  
      // === DATE INFO ===
      const date = new Date();
      const formattedDate = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      const formattedTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  
      // === TRANSACTION BOX ===
      (doc as any).setGState(new (doc as any).GState({ opacity: 0.85 }));
      doc.setDrawColor(...brandColors.accent);
      doc.roundedRect(14, yPos, pageWidth - 28, 20, 2, 2, "S");
      (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
  
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandColors.dark);
      doc.text("TRANSACTION DETAILS", 18, yPos + 6);
  
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...brandColors.subtle);
      doc.text(`Date: ${formattedDate}`, 18, yPos + 12);
      doc.text(`Time: ${formattedTime}`, 18, yPos + 17);
      doc.text(`Receipt #: ${Date.now().toString().slice(-8)}`, pageWidth - 18, yPos + 12, { align: "right" });
  
      yPos += 30;
  
      // === PATIENT INFO ===
      if (patient?.name) {
        (doc as any).setGState(new (doc as any).GState({ opacity: 0.85 }));
        doc.setDrawColor(...brandColors.primary);
        doc.roundedRect(14, yPos, pageWidth - 28, 22, 2, 2, "S");
        (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
  
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...brandColors.dark);
        doc.text("PATIENT INFORMATION", 18, yPos + 6);
  
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...brandColors.subtle);
        doc.text(`Name: ${patient.name || "-"}`, 18, yPos + 12);
        doc.text(`Doctor: ${patient.referringDoctor || "-"}`, 18, yPos + 17);
  
        if (patient.age || patient.gender)
          doc.text(`Age: ${patient.age || "-"} | Gender: ${patient.gender || "-"}`, pageWidth - 18, yPos + 12, { align: "right" });
  
        if (patient.phone)
          doc.text(`Phone: ${patient.phone}`, pageWidth - 18, yPos + 17, { align: "right" });
  
        yPos += 30;
      }
  
      // === TABLE (unchanged) ===
      const tableData = cart.map((item, i) => [
        (i + 1).toString(),
        item.medicineName,
        item.dosage || "-",
        item.quantity.toString(),
        `PKR ${item.price.toFixed(2)}`,
        `PKR ${(item.quantity * item.price).toFixed(2)}`,
        item.instructions || "-",
      ]);
  
      autoTable(doc, {
        startY: yPos,
        head: [["#", "Medicine", "Dosage", "Qty", "Price", "Total", "Instructions"]],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 5,
          halign: "center",
          valign: "middle",
          textColor: [40, 40, 40],
          fillColor: undefined,
          lineWidth: 0.15,
          lineColor: [0, 102, 204],
        },
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          cellPadding: 6,
          lineWidth: 0.2,
          lineColor: [0, 102, 204],
        },
        alternateRowStyles: { fillColor: undefined },
      });
  
      // === TOTAL BOX AND FOOTER (unchanged) ===
      const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const finalY = (doc as any).lastAutoTable.finalY + 10;
  
      const boxX = pageWidth - 75;
      const boxY = finalY;
      const boxW = 60;
      const boxH = 20;
  
      (doc as any).setGState(new (doc as any).GState({ opacity: 0.15 }));
      doc.setFillColor(...brandColors.primary);
      doc.roundedRect(boxX, boxY, boxW, boxH, 4, 4, "F");
      (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
  
      doc.setDrawColor(...brandColors.accent);
      doc.roundedRect(boxX, boxY, boxW, boxH, 4, 4, "S");
  
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.dark);
      doc.text("TOTAL AMOUNT", boxX + 5, boxY + 7);
      doc.setFontSize(13);
      doc.setTextColor(...brandColors.primary);
      doc.text(`PKR ${totalAmount.toFixed(2)}`, boxX + boxW - 5, boxY + 14, { align: "right" });
  
      const footerY = pageHeight - 20;
      doc.setDrawColor(...brandColors.accent);
      doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
  
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...brandColors.subtle);
      doc.text("Thank you for choosing SMMC Laboratory", pageWidth / 2, footerY, { align: "center" });
  
      doc.setFontSize(7);
      doc.text("This is a computer-generated receipt and does not require a signature.", pageWidth / 2, footerY + 5, { align: "center" });
      doc.text("info@smmclab.com | +92-XXX-XXXXXXX", pageWidth / 2, footerY + 10, { align: "center" });
  
      const fileName = `SMMC_Receipt_${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  }
  
// BottleResult — PDF Academic Result Sheet Generator
import { jsPDF } from 'jspdf';
import { generateVerificationQR } from '../qr/generateQR';
import type { StudentWithDetails } from '@/types';
import type { StudentResultOutput } from '../result-engine/types';

export async function generateStudentResultPDF(
  student: any,
  calculated: StudentResultOutput,
  verificationUrl: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Deep navy #0f172a
  doc.rect(0, 0, pageWidth, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BottleResult Intelligence Platform', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Secondary School Academic Transcript & GPA Report', pageWidth / 2, 22, {
    align: 'center',
  });
  doc.text('“Every Result Has a Reason” — Verified & Audited Record', pageWidth / 2, 28, {
    align: 'center',
  });

  // 2. Student Info Card
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT CREDENTIALS', 14, 48);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 51, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text(`Student Name:`, 18, 58);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.name}`, 44, 58);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Student ID:`, 18, 65);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.student_code || student.id}`, 44, 65);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Academic Case:`, 18, 72);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.case_code || 'PUB-01'}`, 44, 72);

  // Right column of info card
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Class:`, 110, 58);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.class_name || 'Class 9'}`, 140, 58);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Optional (4th):`, 110, 65);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.optional_subject_name || student.optional_subject_code || 'None'}`, 140, 65);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Status:`, 110, 72);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(calculated.passed ? 16 : 225, calculated.passed ? 185 : 29, calculated.passed ? 129 : 72);
  doc.text(`${calculated.passed ? 'PASSED' : 'FAILED'}`, 140, 72);

  // 3. Subject Marks Table
  let currentY = 88;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBJECT-WISE PERFORMANCE BREAKDOWN', 14, currentY);

  currentY += 4;
  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(14, currentY, pageWidth - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  doc.text('CODE', 18, currentY + 5.5);
  doc.text('SUBJECT TITLE', 35, currentY + 5.5);
  doc.text('TYPE', 88, currentY + 5.5);
  doc.text('THEORY', 110, currentY + 5.5);
  doc.text('PRACTICAL', 130, currentY + 5.5);
  doc.text('TOTAL', 154, currentY + 5.5);
  doc.text('GP', 170, currentY + 5.5);
  doc.text('GRADE', 184, currentY + 5.5);

  currentY += 8;

  // Rows
  calculated.subjectResults.forEach((sr, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(14, currentY, pageWidth - 28, 7.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    doc.text(sr.subjectCode, 18, currentY + 5);
    doc.text(sr.subjectName.substring(0, 26), 35, currentY + 5);
    doc.text(sr.isCompulsory ? 'Compulsory' : 'Optional', 88, currentY + 5);

    const theoryStr = sr.isAbsent ? 'AB' : sr.theoryMarks !== null ? `${sr.theoryMarks}` : '—';
    const practicalStr = sr.isAbsent ? 'AB' : sr.practicalMarks !== null ? `${sr.practicalMarks}` : '—';

    doc.text(theoryStr, 110, currentY + 5);
    doc.text(practicalStr, 130, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(sr.isAbsent ? 'AB' : `${sr.totalMarks}`, 154, currentY + 5);
    doc.text(sr.gradePoint.toFixed(2), 170, currentY + 5);

    // Letter grade with color
    if (!sr.passed) {
      doc.setTextColor(225, 29, 72);
    } else if (sr.gradePoint === 5.0) {
      doc.setTextColor(16, 185, 129);
    } else {
      doc.setTextColor(30, 41, 59);
    }
    doc.text(sr.letterGrade, 184, currentY + 5);

    currentY += 7.5;
  });

  // Table bottom line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY, pageWidth - 14, currentY);

  // 4. GPA Summary Card
  currentY += 6;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 2, 2, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CALCULATION SUMMARY & COMPOSITE GPA', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Compulsory GP Sum: ${calculated.compulsoryGradePointSum.toFixed(2)}  |  Optional Contribution: +${calculated.optionalContribution.toFixed(2)}  |  Total GP: ${calculated.totalGradePointSum.toFixed(2)} / 6`,
    18,
    currentY + 12
  );
  doc.text(
    `Official Formula: [Sum(6 Compulsory GP) + max(0, Optional GP - 2.00)] / 6`,
    18,
    currentY + 17
  );

  // Big GPA Badge on right of summary card
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(pageWidth - 62, currentY + 3, 44, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('FINAL GPA / GRADE', pageWidth - 40, currentY + 8, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `${calculated.gpa.toFixed(2)} (${calculated.letterGrade})`,
    pageWidth - 40,
    currentY + 16,
    { align: 'center' }
  );

  // 5. QR Code & Verification Block
  currentY += 32;
  const qrBase64 = await generateVerificationQR(verificationUrl);
  if (qrBase64) {
    doc.addImage(qrBase64, 'PNG', 14, currentY, 24, 24);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DIGITAL VERIFICATION & AUTHENTICITY', 42, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Scan the QR code to verify this result against official records.', 42, currentY + 10);
  doc.text(`Verification URL: ${verificationUrl}`, 42, currentY + 14);
  doc.text(`Engine Version: ${calculated.trace.calculationVersion} | Generated: ${new Date().toLocaleDateString()}`, 42, currentY + 18);

  // 6. Signatures
  doc.line(pageWidth - 65, currentY + 16, pageWidth - 14, currentY + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Authorized Examination Controller', pageWidth - 39.5, currentY + 20, {
    align: 'center',
  });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'BottleResult Intelligence Platform — Deterministic, Verifiable & Explainable School Result System',
    pageWidth / 2,
    290,
    { align: 'center' }
  );

  doc.save(`Result_${student.student_code || student.id}_${student.case_code || 'PUB-01'}.pdf`);
}

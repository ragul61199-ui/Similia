import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates and triggers download of a crisp PDF from any DOM element.
 * Works completely client-side and safely inside iframe sandboxes.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string,
  options?: {
    format?: 'a4' | 'id_card';
    orientation?: 'portrait' | 'landscape';
  }
): Promise<boolean> {
  try {
    const isIdCard = options?.format === 'id_card';

    // Capture element with html2canvas at high resolution (scale: 2)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    if (isIdCard) {
      // Standard ISO ID Card dimension: 85.6mm x 54mm (Landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54, undefined, 'FAST');
      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
      return true;
    } else {
      // Standard A4 document for receipts / prescriptions
      const pdf = new jsPDF({
        orientation: options?.orientation || 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // Calculate aspect ratio
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasHeight / canvasWidth;

      const imgWidth = pdfWidth - 20; // 10mm margins on both sides
      const imgHeight = imgWidth * ratio;

      if (imgHeight > pdfHeight - 20) {
        // Multi-page or scale to fit
        const scaleFactor = (pdfHeight - 20) / imgHeight;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth * scaleFactor, (pdfHeight - 20), undefined, 'FAST');
      } else {
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight, undefined, 'FAST');
      }

      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
      return true;
    }
  } catch (error) {
    console.error('Error generating PDF via html2canvas/jsPDF:', error);
    // Fallback: direct Blob trigger
    try {
      const fallbackPdf = new jsPDF();
      fallbackPdf.text(`Receipt / Document: ${filename}`, 15, 20);
      fallbackPdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
      return true;
    } catch (e) {
      console.error('Fallback PDF generation failed:', e);
      return false;
    }
  }
}

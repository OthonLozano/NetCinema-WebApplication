import { jsPDF } from 'jspdf';

/**
 * Convierte un elemento SVG a dataURL PNG (string) escalado.
 * @param {SVGElement} svgElement
 * @param {number} scale multiplicador (ej 2-4)
 * @returns {Promise<string>} dataURL PNG
 */
export async function svgToPngDataUrl(svgElement, scale = 4) {
  if (!svgElement) throw new Error('SVG element not found');

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.width || 200;
        const height = img.height || 200;
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        // fondo blanco para PDF
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Genera y descarga un PDF con los datos de la reserva y el QR (dataURL PNG).
 * @param {Object} reserva - objeto reserva (debe contener codigoReserva, asientos, nombreCliente, emailCliente, total, id)
 * @param {Object} funcion - objeto funcion (pelicula, sala, fechaHora, precio)
 * @param {string} qrDataUrl - dataURL PNG del QR (si no se pasa, PDF se genera sin QR)
 * @returns {Promise<void>}
 */
export async function generateReservationPdf(reserva, funcion, qrDataUrl = null) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = margin;

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Ticket - NetCinema', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
  y += 30;

  // Código reserva destacado
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#333');
  doc.text(`Código: ${reserva.codigoReserva}`, margin, y);
  y += 20;

  // Fecha generación
  const fechaNow = new Date().toLocaleString('es-ES');
  doc.setFontSize(10);
  doc.setTextColor('#666');
  doc.text(`Generado: ${fechaNow}`, margin, y);
  y += 20;

  // Espacio antes de detalles
  y += 8;

  // Si hay QR lo ubicamos a la derecha; detalles a la izquierda
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  const qrWidth = 150;
  const leftColWidth = contentWidth - qrWidth - 10;

  // Detalles (izquierda)
  doc.setFontSize(12);
  doc.setTextColor('#222');
  const lineHeight = 16;
  const startX = margin;
  let cursorY = y;

  doc.text(`Película: ${funcion.pelicula.titulo}`, startX, cursorY);
  cursorY += lineHeight;
  doc.text(`Sala: ${funcion.sala.nombre} (${funcion.sala.tipo})`, startX, cursorY);
  cursorY += lineHeight;
  doc.text(
    `Fecha y hora: ${new Date(funcion.fechaHora).toLocaleString('es-ES')}`,
    startX,
    cursorY
  );
  cursorY += lineHeight;
  doc.text(`Asientos: ${reserva.asientos.join(', ')}`, startX, cursorY);
  cursorY += lineHeight;
  doc.text(`Cliente: ${reserva.nombreCliente}`, startX, cursorY);
  cursorY += lineHeight;
  doc.text(`Email: ${reserva.emailCliente}`, startX, cursorY);
  cursorY += lineHeight;
  doc.text(`Total: $${reserva.total.toFixed(2)}`, startX, cursorY);
  cursorY += lineHeight;

  // QR (derecha)
  if (qrDataUrl) {
    const qrX = margin + leftColWidth + 10;
    const qrY = y;
    // ajusta tamaño si es necesario
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrWidth, qrWidth);
  }

  // Footer / nota
  let afterY = Math.max(cursorY, y + qrWidth) + 20;
  doc.setFontSize(10);
  doc.setTextColor('#666');
  doc.text(
    'Presenta este ticket con el QR en la entrada del cine. No compartas tu código si quieres evitar usos no autorizados.',
    margin,
    afterY,
    { maxWidth: contentWidth }
  );

  // Guardar / descargar
  const filename = `${reserva.codigoReserva}.pdf`;
  doc.save(filename);
}
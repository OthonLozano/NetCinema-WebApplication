// svgelement es para el elemento SVG que queremos convertir a PNG
// fileName es el nombre del archivo PNG resultante
// scale es un factor de escala para mejorar la resolución del PNG generado
export async function downloadSvgAsPng(svgElement, filename = 'qr.png', scale = 4) {
  if (!svgElement) throw new Error('SVG element no encontrado');
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // utilizar ancho/alto natural del SVG multiplicado por scale
        const width = img.width || 300;
        const height = img.height || 300;
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; // fondo blanco
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('No se pudo generar blob'));
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}
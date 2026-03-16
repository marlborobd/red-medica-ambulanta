const PDFDocument = require('pdfkit');

function generateTripPDF(trip, driver) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc.fontSize(18).fillColor('#E24B4A').text('RED MEDICA - SERVICIU AMBULANTA ARAD', { align: 'center' });
    doc.fontSize(10).fillColor('#333').text('Str. Exemplu nr. 1, Arad | Tel: 0257-000000', { align: 'center' });
    doc.moveDown();

    // Document info
    doc.fontSize(12).fillColor('#000').text(`Nr. document: ${trip.trip_number}`, { continued: true });
    doc.text(`  |  Data: ${new Date(trip.scheduled_at).toLocaleDateString('ro-RO')}`, { align: 'right' });
    doc.moveDown();

    doc.fontSize(11).fillColor('#E24B4A').text('DATE SOFER');
    doc.fontSize(10).fillColor('#000');
    doc.text(`Nume: ${driver ? driver.name : '-'}`);
    doc.text(`Nr. legitimatie: ${driver ? (driver.license_number || '-') : '-'}`);
    doc.text(`Nr. masina: ${driver ? (driver.vehicle_plate || '-') : '-'}`);
    doc.moveDown();

    doc.fontSize(11).fillColor('#E24B4A').text('DATE PACIENT');
    doc.fontSize(10).fillColor('#000');
    doc.text(`Nume: ${trip.patient_name}`);
    doc.text(`Varsta: ${trip.patient_age || '-'}`);
    doc.text(`CNP: ${trip.patient_cnp || '-'}`);
    doc.text(`Telefon: ${trip.patient_phone || '-'}`);
    doc.text(`Diagnostic / Motiv transport: ${trip.diagnosis || '-'}`);
    doc.moveDown();

    doc.fontSize(11).fillColor('#E24B4A').text('ITINERARIU');
    doc.fontSize(10).fillColor('#000');
    doc.text(`Adresa preluare: ${trip.pickup_address}`);
    doc.text(`Destinatie: ${trip.destination_address}`);
    doc.text(`Distanta: ${trip.distance_km || '-'} km`);
    doc.text(`Durata estimata: ${trip.duration_min || '-'} min`);
    doc.moveDown();

    doc.fontSize(11).fillColor('#E24B4A').text('CALCUL COST');
    doc.fontSize(10).fillColor('#000');
    doc.text(`Distanta x Tarif/km: ${trip.distance_km || 0} km x ${trip.price_per_km || 0} RON/km`);
    doc.text(`Supliment (${trip.trip_type}): ${trip.surcharge_pct || 0}%`);
    doc.fontSize(12).fillColor('#E24B4A').text(`TOTAL: ${trip.total_cost || 0} RON`);
    doc.fillColor('#000');
    doc.moveDown(2);

    // Signatures
    doc.fontSize(10);
    const sigY = doc.y;
    doc.text('Semnatura pacient/aparinator', 50, sigY);
    doc.moveTo(50, sigY + 40).lineTo(220, sigY + 40).stroke();
    doc.text('Semnatura si stampila sofer', 330, sigY);
    doc.moveTo(330, sigY + 40).lineTo(500, sigY + 40).stroke();

    doc.end();
  });
}

module.exports = { generateTripPDF };

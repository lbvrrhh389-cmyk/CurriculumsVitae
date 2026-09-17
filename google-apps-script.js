/**
 * LBV RRHH - Pegá este código en Google Apps Script
 *
 * Pasos:
 * 1) Creá un Google Sheet (ej. "LBV Solicitudes")
 * 2) Extensiones → Apps Script → pegá TODO este archivo
 * 3) Ajustá FOLDER_ID (carpeta de Drive) si querés una carpeta fija
 * 4) Implementar → Nueva implementación → Tipo: App web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona
 * 5) Copiá la URL de la app web y pegala en google-config.js (WEB_APP_URL)
 */

var SHEET_NAME = 'Solicitudes';

// Opcional: ID de carpeta de Drive. Si queda vacío, crea/usa "LBV RRHH Archivos" en Mi unidad
var FOLDER_ID = '';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var folder = getOrCreateFolder_();
    var fotoUrl = '';
    var comprobanteUrl = '';

    if (data.photoBase64) {
      var foto = saveBase64ToDrive_(folder, data.photoBase64, data.photoName || (data.id + '_foto.jpg'));
      fotoUrl = foto.getUrl();
    }
    if (data.comprobanteBase64) {
      var comp = saveBase64ToDrive_(folder, data.comprobanteBase64, data.comprobanteName || (data.id + '_comprobante.pdf'));
      comprobanteUrl = comp.getUrl();
    }

    var sheet = getOrCreateSheet_();
    ensureHeader_(sheet);

    sheet.appendRow([
      new Date(),
      data.id || '',
      data.nombre || '',
      data.email || '',
      data.telefono || '',
      data.provincia || '',
      data.localidad || '',
      data.direccion || '',
      data.ubicacion || '',
      data.puesto || '',
      data.objetivo || '',
      data.template || '',
      fotoUrl,
      comprobanteUrl,
      data.comprobanteName || ''
    ]);

    return json_({ ok: true, fotoUrl: fotoUrl, comprobanteUrl: comprobanteUrl });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'LBV RRHH Sheets+Drive' });
}

function getOrCreateFolder_() {
  if (FOLDER_ID) {
    return DriveApp.getFolderById(FOLDER_ID);
  }
  var name = 'LBV RRHH Archivos';
  var it = DriveApp.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(name);
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  return sh;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow([
    'Fecha',
    'ID',
    'Nombre',
    'Email',
    'Teléfono',
    'Provincia',
    'Localidad',
    'Dirección',
    'Ubicación',
    'Profesión',
    'Objetivo',
    'Plantilla',
    'Foto (Drive)',
    'Comprobante (Drive)',
    'Nombre comprobante'
  ]);
  sheet.getRange(1, 1, 1, 15).setFontWeight('bold');
}

function saveBase64ToDrive_(folder, dataUrlOrB64, filename) {
  var raw = String(dataUrlOrB64);
  var contentType = 'application/octet-stream';
  var b64 = raw;

  var m = raw.match(/^data:([^;]+);base64,(.+)$/);
  if (m) {
    contentType = m[1];
    b64 = m[2];
  }

  var blob = Utilities.newBlob(Utilities.base64Decode(b64), contentType, filename);
  var file = folder.createFile(blob);
  // Link para que cualquiera con el enlace pueda ver (ajustá si preferís privado)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

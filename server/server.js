/**
 * LBV RRHH - Servidor Node.js (sin dependencias externas)
 * Solo usa módulos nativos: http, fs, path, crypto, url
 *
 * npm start  →  node server.js
 * http://localhost:3000/index.html
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lbvadmin';
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'solicitudes.json');

[DATA_DIR, UPLOADS_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]', 'utf8');

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
}

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  });
  res.end(body);
}

function isAdmin(req) {
  const key = req.headers['x-admin-key'] || '';
  return key === ADMIN_PASSWORD;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res, filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    return res.end('Not found');
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Access-Control-Allow-Origin': '*',
  });
  fs.createReadStream(filePath).pipe(res);
}

/** Parse multipart/form-data de forma simple */
function parseMultipart(buffer, boundary) {
  const parts = {};
  const files = {};
  const sep = Buffer.from('--' + boundary);
  let start = buffer.indexOf(sep) + sep.length + 2; // skip \r\n

  while (start < buffer.length) {
    const next = buffer.indexOf(sep, start);
    if (next < 0) break;
    let part = buffer.slice(start, next - 2); // trim \r\n
    start = next + sep.length + 2;

    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd < 0) continue;
    const headerText = part.slice(0, headerEnd).toString('utf8');
    const content = part.slice(headerEnd + 4);

    const nameMatch = headerText.match(/name="([^"]+)"/);
    const fileMatch = headerText.match(/filename="([^"]*)"/);
    const name = nameMatch ? nameMatch[1] : null;
    if (!name) continue;

    if (fileMatch && fileMatch[1]) {
      const filename = fileMatch[1];
      const ctMatch = headerText.match(/Content-Type:\s*(.+)/i);
      files[name] = {
        filename,
        contentType: ctMatch ? ctMatch[1].trim() : 'application/octet-stream',
        data: content,
      };
    } else {
      parts[name] = content.toString('utf8');
    }
  }
  return { parts, files };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function saveBase64Image(dataUrl) {
  const match = String(dataUrl).match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) return null;
  const ext = match[1].includes('png') ? '.png' : '.jpg';
  const filename = `${Date.now()}-${uuid()}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(match[2], 'base64'));
  return `/uploads/${filename}`;
}

async function handleCreateSolicitud(req, res) {
  try {
    const body = await readBody(req);
    const ct = req.headers['content-type'] || '';
    let payload = {};
    let comprobanteFile = null;

    if (ct.includes('multipart/form-data')) {
      const boundaryMatch = ct.match(/boundary=(.+)$/);
      if (!boundaryMatch) return sendJSON(res, 400, { error: 'Boundary inválido' });
      const { parts, files } = parseMultipart(body, boundaryMatch[1].trim());
      if (parts.data) {
        payload = JSON.parse(parts.data);
      }
      if (files.comprobante) comprobanteFile = files.comprobante;
      if (files.foto) {
        const ext = path.extname(files.foto.filename) || '.jpg';
        const filename = `${Date.now()}-${uuid()}${ext}`;
        fs.writeFileSync(path.join(UPLOADS_DIR, filename), files.foto.data);
        payload._photoFromFile = `/uploads/${filename}`;
      }
    } else {
      payload = JSON.parse(body.toString('utf8') || '{}');
    }

    let photoUrl = payload._photoFromFile || null;
    if (!photoUrl && payload.photoData) {
      photoUrl = saveBase64Image(payload.photoData);
    }

    let comprobanteUrl = null;
    let comprobanteName = payload.comprobanteName || null;
    if (comprobanteFile) {
      const ext = path.extname(comprobanteFile.filename) || '.pdf';
      const filename = `${Date.now()}-${uuid()}${ext}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), comprobanteFile.data);
      comprobanteUrl = `/uploads/${filename}`;
      comprobanteName = comprobanteFile.filename;
    }

    const solicitud = {
      id: uuid(),
      fecha: new Date().toISOString(),
      nombre: payload.nombre || '',
      email: payload.email || '',
      telefono: payload.telefono || '',
      ubicacion: payload.ubicacion || '',
      linkedin: payload.linkedin || '',
      puesto: payload.puesto || '',
      resumenUsuario: payload.resumenUsuario || '',
      objetivo: payload.objetivo || '',
      idiomas: payload.idiomas || '',
      herramientas: payload.herramientas || '',
      habilidades: Array.isArray(payload.habilidades)
        ? payload.habilidades
        : String(payload.habilidades || '')
            .split(/[,;\n]+/)
            .map((s) => s.trim())
            .filter(Boolean),
      experiencias: payload.experiencias || [],
      estudiosSuperiores: payload.estudiosSuperiores || [],
      estudiosSecundarios: payload.estudiosSecundarios || [],
      cursos: payload.cursos || [],
      template: payload.template || 'moderno',
      photoUrl,
      photoData: null,
      comprobanteUrl,
      comprobanteName,
    };

    const db = readDB();
    db.unshift(solicitud);
    writeDB(db);

    sendJSON(res, 201, { ok: true, id: solicitud.id, message: 'Solicitud guardada' });
  } catch (err) {
    console.error(err);
    sendJSON(res, 500, { error: err.message || 'Error al guardar' });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    });
    return res.end();
  }

  // API
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, service: 'LBV RRHH API' });
  }

  if (pathname === '/api/solicitudes' && req.method === 'POST') {
    return handleCreateSolicitud(req, res);
  }

  if (pathname === '/api/solicitudes' && req.method === 'GET') {
    if (!isAdmin(req)) return sendJSON(res, 401, { error: 'No autorizado' });
    return sendJSON(res, 200, readDB());
  }

  if (pathname === '/api/solicitudes' && req.method === 'DELETE') {
    if (!isAdmin(req)) return sendJSON(res, 401, { error: 'No autorizado' });
    const db = readDB();
    db.forEach((item) => {
      [item.photoUrl, item.comprobanteUrl].forEach((u) => {
        if (u && u.startsWith('/uploads/')) {
          const fp = path.join(UPLOADS_DIR, path.basename(u));
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
      });
    });
    writeDB([]);
    return sendJSON(res, 200, { ok: true });
  }

  const idMatch = pathname.match(/^\/api\/solicitudes\/([^/]+)$/);
  if (idMatch) {
    if (!isAdmin(req)) return sendJSON(res, 401, { error: 'No autorizado' });
    const id = decodeURIComponent(idMatch[1]);
    if (req.method === 'GET') {
      const item = readDB().find((s) => s.id === id);
      if (!item) return sendJSON(res, 404, { error: 'No encontrada' });
      return sendJSON(res, 200, item);
    }
    if (req.method === 'DELETE') {
      let db = readDB();
      const item = db.find((s) => s.id === id);
      if (!item) return sendJSON(res, 404, { error: 'No encontrada' });
      [item.photoUrl, item.comprobanteUrl].forEach((u) => {
        if (u && u.startsWith('/uploads/')) {
          const fp = path.join(UPLOADS_DIR, path.basename(u));
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
      });
      db = db.filter((s) => s.id !== id);
      writeDB(db);
      return sendJSON(res, 200, { ok: true });
    }
  }

  // Uploads
  if (pathname.startsWith('/uploads/')) {
    const fp = path.join(UPLOADS_DIR, path.basename(pathname));
    return serveStatic(req, res, fp);
  }

  // Frontend estático
  let filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);
  // seguridad: no salir de ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, 'index.html');
  }
  return serveStatic(req, res, filePath);
});

server.listen(PORT, () => {
  console.log(`LBV RRHH API en http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}/index.html`);
  console.log(`Admin key: ${ADMIN_PASSWORD}`);
});


// LBV RRHH - Generador de CV v3 (Cliente + Admin)
const ADMIN_PASSWORD = 'lbvadmin';
const STORAGE_KEY = 'lbv_solicitudes';

const state = {
    currentStep: 1,
    totalSteps: 6,
    photoData: null,
    photoPos: { x: 50, y: 50, scale: 1 },
    comprobanteData: null,
    comprobanteName: null,
    experiencias: [],
    estudiosSuperiores: [],
    estudiosSecundarios: [],
    cursos: [],
    selectedTemplate: 'moderno',
    // Admin
    currentSolicitud: null,
    adminTemplate: 'moderno',
    adminEdited: false
};

const SKILL_EXAMPLES = [
    { cat: 'Actitud y soft skills', items: [
        'Trabajo en equipo', 'Responsabilidad', 'Puntualidad', 'Proactividad',
        'Comunicación efectiva', 'Adaptabilidad', 'Orientación al cliente',
        'Resolución de problemas', 'Organización', 'Compromiso'
    ]},
    { cat: 'Habilidades generales', items: [
        'Atención al público', 'Manejo de caja', 'Archivo y documentación',
        'Gestión de agendas', 'Redacción de informes', 'Atención telefónica',
        'Ventas', 'Cobranza', 'Inventario', 'Logística básica'
    ]},
    { cat: 'Ofimática y digital', items: [
        'Microsoft Word', 'Microsoft Excel', 'PowerPoint', 'Google Docs',
        'Correo electrónico', 'Redes sociales', 'Navegación web'
    ]}
];

const COMPETENCY_MAP = {
    'trabajo en equipo': 'Capacidad de trabajo colaborativo y construcción de relaciones interpersonales efectivas',
    'responsabilidad': 'Alto sentido de la responsabilidad y cumplimiento de objetivos',
    'puntualidad': 'Rigor en el cumplimiento de horarios y plazos establecidos',
    'proactividad': 'Actitud proactiva orientada a la mejora continua y anticipación de necesidades',
    'comunicación efectiva': 'Habilidades de comunicación clara, asertiva y orientada a resultados',
    'adaptabilidad': 'Flexibilidad y capacidad de adaptación a entornos cambiantes',
    'orientación al cliente': 'Fuerte orientación al cliente y a la excelencia en el servicio',
    'resolución de problemas': 'Capacidad analítica para la identificación y resolución de problemas',
    'organización': 'Excelente organización personal y gestión eficiente del tiempo',
    'compromiso': 'Compromiso con los valores y objetivos de la organización',
    'atención al público': 'Destreza en la atención al público y gestión de la experiencia del cliente',
    'manejo de caja': 'Experiencia en manejo de caja, control de efectivo y conciliación',
    'archivo y documentación': 'Orden y precisión en la gestión documental y archivo',
    'gestión de agendas': 'Organización de agendas, coordinación de reuniones y seguimiento de tareas',
    'redacción de informes': 'Capacidad de redacción clara y estructurada de informes y reportes',
    'atención telefónica': 'Habilidad en atención telefónica profesional y gestión de consultas',
    'ventas': 'Orientación comercial y habilidades de venta consultiva',
    'cobranza': 'Experiencia en gestión de cobranza y seguimiento de cuentas por cobrar',
    'inventario': 'Control de inventarios y gestión de stock',
    'logística básica': 'Conocimientos de logística operativa y coordinación de entregas',
    'microsoft word': 'Dominio de Microsoft Word para elaboración de documentos profesionales',
    'microsoft excel': 'Manejo avanzado de Microsoft Excel (fórmulas, tablas dinámicas y análisis de datos)',
    'powerpoint': 'Elaboración de presentaciones efectivas con PowerPoint',
    'google docs': 'Manejo de Google Workspace (Docs, Sheets, Drive)',
    'correo electrónico': 'Gestión profesional de correo electrónico y comunicación digital',
    'redes sociales': 'Manejo de redes sociales con fines profesionales y de comunicación',
    'navegación web': 'Competencia digital y búsqueda efectiva de información en internet',
    'liderazgo': 'Liderazgo de equipos y capacidad de motivación hacia el logro de objetivos',
    'negociación': 'Habilidades de negociación y búsqueda de acuerdos win-win',
    'creatividad': 'Pensamiento creativo e innovador orientado a soluciones',
    'trabajo bajo presión': 'Capacidad de desempeño efectivo bajo presión y en contextos de alta demanda'
};

document.addEventListener('DOMContentLoaded', () => {
    addExperiencia();
    addEstudioSuperior();
    addEstudioSecundario();
    renderSkillExamples();
    
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
    document.getElementById('comprobanteInput').addEventListener('change', handleComprobanteUpload);
    
    // Enter en password admin
    document.getElementById('adminPassword')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') verificarAdmin();
    });

    // Si hay ?admin=1 en la URL, mostrar login
    if (new URLSearchParams(location.search).has('admin')) {
        mostrarLoginAdmin();
    }

    updateProgress();
});

function renderSkillExamples() {
    const container = document.getElementById('skillExamples');
    let html = '';
    SKILL_EXAMPLES.forEach(group => {
        html += `<span class="skill-chip category">${group.cat}</span>`;
        group.items.forEach(item => {
            html += `<button type="button" class="skill-chip" onclick="addSkill('${item.replace(/'/g, "\\'")}')">${item}</button>`;
        });
    });
    container.innerHTML = html;
}

function addSkill(skill) {
    const ta = document.getElementById('habilidades');
    const current = ta.value.trim();
    const list = current ? current.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : [];
    if (!list.some(s => s.toLowerCase() === skill.toLowerCase())) {
        list.push(skill);
        ta.value = list.join(', ');
    }
}

function addToField(fieldId, text) {
    const ta = document.getElementById(fieldId);
    const current = ta.value.trim();
    if (current) {
        if (!current.toLowerCase().includes(text.toLowerCase())) {
            ta.value = current + ', ' + text;
        }
    } else {
        ta.value = text;
    }
}

function selectTemplate(name) {
    state.selectedTemplate = name;
    document.querySelectorAll('.template-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.template === name);
    });
}

function nextStep(fromStep) {
    if (!validateStep(fromStep)) return;
    document.getElementById(`step${fromStep}`).classList.remove('active');
    state.currentStep = fromStep + 1;
    document.getElementById(`step${state.currentStep}`).classList.add('active');
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(fromStep) {
    document.getElementById(`step${fromStep}`).classList.remove('active');
    state.currentStep = fromStep - 1;
    document.getElementById(`step${state.currentStep}`).classList.add('active');
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
    const percent = (state.currentStep / state.totalSteps) * 100;
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.querySelectorAll('.step-indicator').forEach(el => {
        const step = parseInt(el.dataset.step);
        el.classList.remove('active', 'completed');
        if (step === state.currentStep) el.classList.add('active');
        else if (step < state.currentStep) el.classList.add('completed');
    });
}

function validateStep(step) {
    if (step === 1) {
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const ubicacion = document.getElementById('ubicacion').value.trim();
        if (!nombre || !email || !telefono || !ubicacion) {
            alert('Por favor completá todos los campos obligatorios (marcados con *).');
            return false;
        }
        if (!email.includes('@')) {
            alert('Ingresá un email válido.');
            return false;
        }
        return true;
    }
    if (step === 4) {
        const objetivo = document.getElementById('objetivo').value.trim();
        if (!objetivo) {
            alert('Por favor indicá el objetivo del CV (específico o general).');
            return false;
        }
        return true;
    }
    if (step === 5) {
        if (!state.comprobanteData) {
            alert('Debés adjuntar el comprobante de pago para continuar.');
            return false;
        }
        return true;
    }
    return true;
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
        state.photoData = ev.target.result;
        state.photoPos = { x: 50, y: 50, scale: 1 };
        renderPhotoPreview();
        document.getElementById('photoControls').classList.remove('hidden');
        initPhotoDrag();
    };
    reader.readAsDataURL(file);
}

function renderPhotoPreview() {
    const preview = document.getElementById('photoPreview');
    if (!state.photoData) return;
    preview.classList.add('has-photo');
    preview.innerHTML = `<img id="photoImg" src="${state.photoData}" alt="Foto de perfil" style="object-position: ${state.photoPos.x}% ${state.photoPos.y}%; transform: scale(${state.photoPos.scale});">`;
}

function applyPhotoTransform() {
    const img = document.getElementById('photoImg');
    if (!img) return;
    img.style.objectPosition = `${state.photoPos.x}% ${state.photoPos.y}%`;
    img.style.transform = `scale(${state.photoPos.scale})`;
}

function nudgePhoto(dx, dy) {
    state.photoPos.x = Math.max(0, Math.min(100, state.photoPos.x + dx));
    state.photoPos.y = Math.max(0, Math.min(100, state.photoPos.y + dy));
    applyPhotoTransform();
}

function zoomPhoto(delta) {
    state.photoPos.scale = Math.max(1, Math.min(2.5, +(state.photoPos.scale + delta).toFixed(2)));
    applyPhotoTransform();
}

function resetPhotoPos() {
    state.photoPos = { x: 50, y: 50, scale: 1 };
    applyPhotoTransform();
}

function initPhotoDrag() {
    const preview = document.getElementById('photoPreview');
    if (!preview || preview._dragBound) return;
    preview._dragBound = true;

    let dragging = false;
    let lastX = 0, lastY = 0;

    const onStart = (clientX, clientY) => {
        dragging = true;
        lastX = clientX;
        lastY = clientY;
    };
    const onMove = (clientX, clientY) => {
        if (!dragging) return;
        const dx = clientX - lastX;
        const dy = clientY - lastY;
        lastX = clientX;
        lastY = clientY;
        // Drag opposite direction moves the focal point
        state.photoPos.x = Math.max(0, Math.min(100, state.photoPos.x - dx * 0.35));
        state.photoPos.y = Math.max(0, Math.min(100, state.photoPos.y - dy * 0.35));
        applyPhotoTransform();
    };
    const onEnd = () => { dragging = false; };

    preview.addEventListener('mousedown', (e) => {
        e.preventDefault();
        onStart(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onEnd);

    preview.addEventListener('touchstart', (e) => {
        if (e.touches[0]) onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    preview.addEventListener('touchmove', (e) => {
        if (e.touches[0]) {
            e.preventDefault();
            onMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
    preview.addEventListener('touchend', onEnd);
}

/** Genera dataURL de la foto ya recortada/centrada en círculo (para el CV) */
function getCroppedPhotoDataURL() {
    if (!state.photoData) return null;
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const size = 400;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // Clip circle
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            const scale = state.photoPos.scale || 1;
            const ox = (state.photoPos.x ?? 50) / 100;
            const oy = (state.photoPos.y ?? 50) / 100;

            // Cover-style draw with object-position
            const iw = img.naturalWidth;
            const ih = img.naturalHeight;
            const base = Math.max(size / iw, size / ih) * scale;
            const dw = iw * base;
            const dh = ih * base;
            const dx = (size - dw) * ox;
            const dy = (size - dh) * oy;

            ctx.drawImage(img, dx, dy, dw, dh);
            resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        img.onerror = () => resolve(state.photoData);
        img.src = state.photoData;
    });
}

function handleComprobanteUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar los 5MB.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
        state.comprobanteData = ev.target.result;
        state.comprobanteName = file.name;
        const preview = document.getElementById('comprobantePreview');
        preview.classList.add('has-file');
        document.getElementById('comprobanteName').textContent = file.name;
        document.getElementById('btnEnviar').disabled = false;
    };
    reader.readAsDataURL(file);
}

// Experiencias
function addExperiencia() {
    const id = Date.now() + Math.random();
    state.experiencias.push({ id });
    const container = document.getElementById('experienciasContainer');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.dataset.id = id;
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeExperiencia(${id})" title="Eliminar">×</button>
        <div class="item-grid">
            <div class="form-group">
                <label>Empresa / Lugar *</label>
                <input type="text" class="exp-empresa" placeholder="Nombre de la empresa">
            </div>
            <div class="form-group">
                <label>Puesto *</label>
                <input type="text" class="exp-puesto" placeholder="Tu cargo">
            </div>
            <div class="form-group">
                <label>Año de inicio *</label>
                <input type="text" class="exp-inicio" placeholder="Ej: 2020 o Marzo 2020">
            </div>
            <div class="form-group">
                <label>Año de fin</label>
                <input type="text" class="exp-fin" placeholder="Ej: 2023 o Actualidad">
            </div>
            <div class="form-group full">
                <label>Tareas y responsabilidades</label>
                <textarea class="exp-tareas" rows="3" placeholder="Describí las principales tareas realizadas..."></textarea>
            </div>
        </div>
    `;
    container.appendChild(div);
}

function removeExperiencia(id) {
    if (state.experiencias.length <= 1) {
        alert('Debe haber al menos una experiencia (podés dejarla vacía si no tenés).');
        return;
    }
    state.experiencias = state.experiencias.filter(e => e.id !== id);
    document.querySelector(`.dynamic-item[data-id="${id}"]`)?.remove();
}

function addEstudioSuperior() {
    const id = Date.now() + Math.random();
    state.estudiosSuperiores.push({ id });
    const container = document.getElementById('estudiosSuperioresContainer');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.dataset.id = id;
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeEstudioSuperior(${id})" title="Eliminar">×</button>
        <div class="item-grid">
            <div class="form-group">
                <label>Título / Carrera</label>
                <input type="text" class="est-titulo" placeholder="Ej: Licenciatura en Administración">
            </div>
            <div class="form-group">
                <label>Establecimiento</label>
                <input type="text" class="est-establecimiento" placeholder="Universidad / Instituto">
            </div>
            <div class="form-group">
                <label>Año de inicio</label>
                <input type="text" class="est-inicio" placeholder="Ej: 2018">
            </div>
            <div class="form-group">
                <label>Año de fin</label>
                <input type="text" class="est-fin" placeholder="Ej: 2022 o En curso">
            </div>
            <div class="form-group">
                <label>Estado</label>
                <select class="est-estado">
                    <option value="Completo">Completo</option>
                    <option value="En curso">En curso</option>
                    <option value="Abandonado">Abandonado</option>
                </select>
            </div>
        </div>
    `;
    container.appendChild(div);
}

function removeEstudioSuperior(id) {
    state.estudiosSuperiores = state.estudiosSuperiores.filter(e => e.id !== id);
    document.querySelector(`#estudiosSuperioresContainer .dynamic-item[data-id="${id}"]`)?.remove();
}

function addEstudioSecundario() {
    const id = Date.now() + Math.random();
    state.estudiosSecundarios.push({ id });
    const container = document.getElementById('estudiosSecundariosContainer');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.dataset.id = id;
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeEstudioSecundario(${id})" title="Eliminar">×</button>
        <div class="item-grid">
            <div class="form-group">
                <label>Título / Orientación</label>
                <input type="text" class="est-titulo" placeholder="Ej: Bachiller en Economía">
            </div>
            <div class="form-group">
                <label>Establecimiento</label>
                <input type="text" class="est-establecimiento" placeholder="Colegio / Escuela">
            </div>
            <div class="form-group">
                <label>Año de inicio</label>
                <input type="text" class="est-inicio" placeholder="Ej: 2012">
            </div>
            <div class="form-group">
                <label>Año de fin</label>
                <input type="text" class="est-fin" placeholder="Ej: 2017">
            </div>
        </div>
    `;
    container.appendChild(div);
}

function removeEstudioSecundario(id) {
    state.estudiosSecundarios = state.estudiosSecundarios.filter(e => e.id !== id);
    document.querySelector(`#estudiosSecundariosContainer .dynamic-item[data-id="${id}"]`)?.remove();
}

function addCurso() {
    const id = Date.now() + Math.random();
    state.cursos.push({ id });
    const container = document.getElementById('cursosContainer');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.dataset.id = id;
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeCurso(${id})" title="Eliminar">×</button>
        <div class="item-grid">
            <div class="form-group">
                <label>Nombre del curso</label>
                <input type="text" class="cur-nombre" placeholder="Ej: Curso de Excel Avanzado">
            </div>
            <div class="form-group">
                <label>Institución / Plataforma</label>
                <input type="text" class="cur-institucion" placeholder="Ej: Coursera, Udemy, etc.">
            </div>
            <div class="form-group">
                <label>Año</label>
                <input type="text" class="cur-anio" placeholder="Ej: 2023">
            </div>
        </div>
    `;
    container.appendChild(div);
}

function removeCurso(id) {
    state.cursos = state.cursos.filter(c => c.id !== id);
    document.querySelector(`#cursosContainer .dynamic-item[data-id="${id}"]`)?.remove();
}

function getFormData() {
    const experiencias = [];
    document.querySelectorAll('#experienciasContainer .dynamic-item').forEach(item => {
        const empresa = item.querySelector('.exp-empresa').value.trim();
        const puesto = item.querySelector('.exp-puesto').value.trim();
        const inicio = item.querySelector('.exp-inicio').value.trim();
        const fin = item.querySelector('.exp-fin').value.trim();
        const tareas = item.querySelector('.exp-tareas').value.trim();
        if (empresa || puesto) {
            experiencias.push({ empresa, puesto, inicio, fin, tareas });
        }
    });

    const estudiosSuperiores = [];
    document.querySelectorAll('#estudiosSuperioresContainer .dynamic-item').forEach(item => {
        const titulo = item.querySelector('.est-titulo').value.trim();
        const establecimiento = item.querySelector('.est-establecimiento').value.trim();
        const inicio = item.querySelector('.est-inicio').value.trim();
        const fin = item.querySelector('.est-fin').value.trim();
        const estado = item.querySelector('.est-estado')?.value || '';
        if (titulo || establecimiento) {
            estudiosSuperiores.push({ titulo, establecimiento, inicio, fin, estado });
        }
    });

    const estudiosSecundarios = [];
    document.querySelectorAll('#estudiosSecundariosContainer .dynamic-item').forEach(item => {
        const titulo = item.querySelector('.est-titulo').value.trim();
        const establecimiento = item.querySelector('.est-establecimiento').value.trim();
        const inicio = item.querySelector('.est-inicio').value.trim();
        const fin = item.querySelector('.est-fin').value.trim();
        if (titulo || establecimiento) {
            estudiosSecundarios.push({ titulo, establecimiento, inicio, fin });
        }
    });

    const cursos = [];
    document.querySelectorAll('#cursosContainer .dynamic-item').forEach(item => {
        const nombre = item.querySelector('.cur-nombre').value.trim();
        const institucion = item.querySelector('.cur-institucion').value.trim();
        const anio = item.querySelector('.cur-anio').value.trim();
        if (nombre) cursos.push({ nombre, institucion, anio });
    });

    const habilidadesRaw = document.getElementById('habilidades').value.trim();
    const habilidades = habilidadesRaw
        ? habilidadesRaw.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
        : [];

    return {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        fecha: new Date().toISOString(),
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        ubicacion: document.getElementById('ubicacion').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        puesto: document.getElementById('puesto').value.trim(),
        resumenUsuario: document.getElementById('resumen').value.trim(),
        objetivo: document.getElementById('objetivo').value.trim(),
        idiomas: document.getElementById('idiomas').value.trim(),
        herramientas: document.getElementById('herramientas').value.trim(),
        habilidades,
        experiencias,
        estudiosSuperiores,
        estudiosSecundarios,
        cursos,
        photoData: state.photoData,
        comprobanteName: state.comprobanteName,
        template: state.selectedTemplate
    };
}

// ===== Guardar solicitud (cliente NO ve el CV) =====
async function enviarSolicitud() {
    if (!validateStep(5)) return;

    const data = getFormData();
    // Aplicar recorte/centrado de la foto
    if (state.photoData) {
        try {
            data.photoData = await getCroppedPhotoDataURL();
        } catch (e) {
            data.photoData = state.photoData;
        }
    }

    // Guardar en localStorage
    let solicitudes = [];
    try {
        solicitudes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {}
    solicitudes.unshift(data);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));
    } catch (e) {
        const sinFoto = { ...data, photoData: null };
        solicitudes[0] = sinFoto;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));
        } catch (e2) {
            alert('Error al guardar. Intentá de nuevo o reducí el tamaño de la foto.');
            return;
        }
    }

    document.getElementById('successDetails').innerHTML = `
        <p><strong>Nombre:</strong> ${data.nombre}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Teléfono:</strong> ${data.telefono}</p>
        <p><strong>Profesión:</strong> ${data.puesto || "—"}</p>
        <p><strong>Comprobante:</strong> ${data.comprobanteName || 'Adjuntado'}</p>
    `;

    document.getElementById('step5').classList.remove('active');
    state.currentStep = 6;
    document.getElementById('step6').classList.add('active');
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== IA Resumen =====
function generarResumenIA(data) {
    if (data.resumenUsuario && data.resumenUsuario.length > 40) {
        return data.resumenUsuario;
    }

    const puesto = data.puesto || 'profesional';
    const objetivo = data.objetivo || 'general';
    const habilidades = data.habilidades || [];
    const expCount = (data.experiencias || []).length;

    const softSkills = [];
    habilidades.forEach(h => {
        const lower = h.toLowerCase();
        if (COMPETENCY_MAP[lower] || ['trabajo en equipo','responsabilidad','proactividad','comunicación','adaptabilidad','organización','compromiso','liderazgo'].some(k => lower.includes(k))) {
            softSkills.push(h);
        }
    });

    // Primera persona: como si el cliente hablara de sí mismo
    let apertura = '';
    if (expCount === 0) {
        apertura = puesto && puesto !== 'profesional'
            ? `Soy un/a profesional orientado/a al área de ${puesto}, con sólida formación y una fuerte motivación por desarrollarme en entornos dinámicos.`
            : `Soy un/a profesional con sólida formación y una fuerte motivación por desarrollarme en entornos dinámicos.`;
    } else if (expCount === 1) {
        apertura = puesto && puesto !== 'profesional'
            ? `Cuento con experiencia en ${puesto} y me caracterizo por mi compromiso y capacidad de aprendizaje continuo.`
            : `Cuento con experiencia laboral y me caracterizo por mi compromiso y capacidad de aprendizaje continuo.`;
    } else {
        apertura = puesto && puesto !== 'profesional'
            ? `Cuento con una sólida trayectoria en ${puesto} y con demostrada capacidad para aportar valor en equipos de trabajo y alcanzar objetivos.`
            : `Cuento con una sólida trayectoria profesional y con demostrada capacidad para aportar valor en equipos de trabajo y alcanzar objetivos.`;
    }

    let actitudes = '';
    if (softSkills.length > 0) {
        const destacadas = softSkills.slice(0, 4).join(', ');
        actitudes = ` Destaco por mis competencias en ${destacadas.toLowerCase()}.`;
    } else {
        actitudes = ' Me defino por una actitud proactiva, orientada a resultados y con un fuerte sentido de la responsabilidad.';
    }

    let herramientasTxt = data.herramientas ? ` Manejo herramientas como ${data.herramientas}.` : '';

    let orientacion = '';
    const objLower = (objetivo || '').toLowerCase();
    if (objLower !== 'general' && objLower.length > 5) {
        orientacion = ` Busco activamente oportunidades como ${objetivo}, donde pueda aplicar mi experiencia y seguir creciendo profesionalmente.`;
    } else {
        orientacion = ' Me encuentro en búsqueda de nuevos desafíos profesionales donde pueda contribuir con mi experiencia y seguir desarrollando mi carrera.';
    }

    return `${apertura}${actitudes}${herramientasTxt}${orientacion}`;
}

function transformarACompetencias(habilidades) {
    return (habilidades || []).map(h => {
        const key = h.toLowerCase().trim();
        if (COMPETENCY_MAP[key]) return COMPETENCY_MAP[key];
        for (const [k, v] of Object.entries(COMPETENCY_MAP)) {
            if (key.includes(k) || k.includes(key)) return v;
        }
        return h.charAt(0).toUpperCase() + h.slice(1);
    });
}

function formatPeriodo(inicio, fin) {
    if (!inicio && !fin) return '';
    if (inicio && fin) return `${inicio} – ${fin}`;
    if (inicio) return `${inicio} – Actualidad`;
    return fin;
}

function buildCVHtml(data) {
    const resumen = generarResumenIA(data);
    const competencias = transformarACompetencias(data.habilidades);

    let photoHtml = data.photoData
        ? `<img src="${data.photoData}" alt="Foto" class="cv-photo">`
        : '';

    let contactParts = [];
    if (data.email) contactParts.push(`<span>✉ ${data.email}</span>`);
    if (data.telefono) contactParts.push(`<span>📱 ${data.telefono}</span>`);
    if (data.ubicacion) contactParts.push(`<span>📍 ${data.ubicacion}</span>`);
    if (data.linkedin) contactParts.push(`<span>🔗 LinkedIn</span>`);

    let experienciasHtml = '';
    if ((data.experiencias || []).length > 0) {
        experienciasHtml = `
            <div class="cv-section">
                <h2 class="cv-section-title">Experiencia Laboral</h2>
                ${data.experiencias.map(exp => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div>
                                <div class="cv-item-title">${exp.puesto || 'Puesto'}</div>
                                <div class="cv-item-subtitle">${exp.empresa || ''}</div>
                            </div>
                            <div class="cv-item-date">${formatPeriodo(exp.inicio, exp.fin)}</div>
                        </div>
                        ${exp.tareas ? `<div class="cv-item-desc">${exp.tareas}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    let superioresHtml = '';
    if ((data.estudiosSuperiores || []).length > 0) {
        superioresHtml = `
            <div class="cv-section">
                <h2 class="cv-section-title">Estudios Superiores</h2>
                ${data.estudiosSuperiores.map(est => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div>
                                <div class="cv-item-title">${est.titulo || 'Título'}</div>
                                <div class="cv-item-subtitle">${est.establecimiento || ''}${est.estado && est.estado !== 'Completo' ? ` (${est.estado})` : ''}</div>
                            </div>
                            <div class="cv-item-date">${formatPeriodo(est.inicio, est.fin)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    let secundariosHtml = '';
    if ((data.estudiosSecundarios || []).length > 0) {
        secundariosHtml = `
            <div class="cv-section">
                <h2 class="cv-section-title">Estudios Secundarios</h2>
                ${data.estudiosSecundarios.map(est => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div>
                                <div class="cv-item-title">${est.titulo || 'Secundario'}</div>
                                <div class="cv-item-subtitle">${est.establecimiento || ''}</div>
                            </div>
                            <div class="cv-item-date">${formatPeriodo(est.inicio, est.fin)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    let cursosHtml = '';
    if ((data.cursos || []).length > 0) {
        cursosHtml = `
            <div class="cv-section">
                <h2 class="cv-section-title">Cursos y Certificaciones</h2>
                ${data.cursos.map(cur => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div>
                                <div class="cv-item-title">${cur.nombre}</div>
                                <div class="cv-item-subtitle">${cur.institucion || ''}</div>
                            </div>
                            <div class="cv-item-date">${cur.anio || ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    let competenciasHtml = '';
    if (competencias.length > 0) {
        competenciasHtml = `
            <div class="cv-section">
                <h2 class="cv-section-title">Competencias</h2>
                <ul class="cv-competencias-list">
                    ${competencias.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    let idiomasHtml = data.idiomas ? `
        <div class="cv-section">
            <h2 class="cv-section-title">Idiomas</h2>
            <div class="cv-item-desc">${data.idiomas}</div>
        </div>
    ` : '';

    let herramientasHtml = data.herramientas ? `
        <div class="cv-section">
            <h2 class="cv-section-title">Herramientas y Software</h2>
            <div class="cv-item-desc">${data.herramientas}</div>
        </div>
    ` : '';

    return `
        <div class="cv-header">
            ${photoHtml}
            <div class="cv-header-info">
                <h1>${data.nombre || 'Nombre Completo'}</h1>
                <div class="cv-puesto">${data.puesto || ''}</div>
                <div class="cv-contact">${contactParts.join('')}</div>
            </div>
        </div>
        <div class="cv-resumen">${resumen}</div>
        ${experienciasHtml}
        ${superioresHtml}
        ${secundariosHtml}
        ${cursosHtml}
        ${competenciasHtml}
        ${idiomasHtml}
        ${herramientasHtml}
    `;
}

// ========== ADMIN ==========
function mostrarLoginAdmin() {
    document.getElementById('adminLoginModal').classList.remove('hidden');
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
}

function cerrarLoginAdmin() {
    document.getElementById('adminLoginModal').classList.add('hidden');
}

function verificarAdmin() {
    const pass = document.getElementById('adminPassword').value;
    if (pass === ADMIN_PASSWORD) {
        cerrarLoginAdmin();
        abrirAdmin();
    } else {
        alert('Contraseña incorrecta.');
    }
}

function abrirAdmin() {
    document.getElementById('clientApp').classList.add('hidden');
    document.getElementById('adminApp').classList.remove('hidden');
    cargarListaSolicitudes();
}

function cerrarAdmin() {
    document.getElementById('adminApp').classList.add('hidden');
    document.getElementById('clientApp').classList.remove('hidden');
    state.currentSolicitud = null;
}

function getSolicitudes() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
        return [];
    }
}

function cargarListaSolicitudes() {
    const lista = document.getElementById('listaSolicitudes');
    const solicitudes = getSolicitudes();

    if (solicitudes.length === 0) {
        lista.innerHTML = '<p class="empty-msg">No hay solicitudes todavía.</p>';
        return;
    }

    lista.innerHTML = solicitudes.map(s => {
        const fecha = s.fecha ? new Date(s.fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '';
        return `
            <div class="solicitud-item ${state.currentSolicitud?.id === s.id ? 'active' : ''}" onclick="seleccionarSolicitud('${s.id}')">
                <div class="nombre">${s.nombre || 'Sin nombre'}</div>
                <div class="meta">${s.puesto || ''} · ${fecha}</div>
                <div class="meta">${s.telefono || ''} · ${s.comprobanteName ? '✓ Pago' : ''}</div>
            </div>
        `;
    }).join('');
}

function seleccionarSolicitud(id) {
    const solicitudes = getSolicitudes();
    const s = solicitudes.find(x => x.id === id);
    if (!s) return;

    state.currentSolicitud = s;
    state.adminTemplate = s.template || 'moderno';

    document.getElementById('adminEmpty').classList.add('hidden');
    document.getElementById('adminCVArea').classList.remove('hidden');

    // Actualizar botones plantilla
    document.querySelectorAll('#adminCVArea .tpl-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tpl === state.adminTemplate);
    });

    renderAdminCV();
    cargarListaSolicitudes(); // refrescar active

    // Meta info
    const fecha = s.fecha ? new Date(s.fecha).toLocaleString('es-AR') : '';
    document.getElementById('adminMeta').innerHTML = `
        <p><strong>ID:</strong> ${s.id}</p>
        <p><strong>Fecha de envío:</strong> ${fecha}</p>
        <p><strong>Comprobante:</strong> ${s.comprobanteName || 'No especificado'}</p>
        <p><strong>Objetivo del CV:</strong> ${s.objetivo || '—'}</p>
        <p><strong>Email:</strong> ${s.email || '—'}</p>
    `;
}

function renderAdminCV() {
    if (!state.currentSolicitud) return;
    const data = { ...state.currentSolicitud, template: state.adminTemplate };
    const html = buildCVHtml(data);
    const preview = document.getElementById('adminCvPreview');
    preview.innerHTML = html;
    preview.className = `cv-document template-${state.adminTemplate}`;
    preview.setAttribute('contenteditable', 'true');
    preview.setAttribute('spellcheck', 'true');
    state.adminEdited = false;
    // Marcar que hubo edición manual
    preview.oninput = () => { state.adminEdited = true; };
}

function adminRestablecerCV() {
    if (!state.currentSolicitud) return;
    if (state.adminEdited && !confirm('Se perderán las correcciones hechas a mano. ¿Restablecer el texto original?')) {
        return;
    }
    renderAdminCV();
}

function adminCambiarPlantilla(nombre) {
    if (state.adminEdited) {
        const ok = confirm(
            'Cambiar de plantilla regenera el CV y puede borrar tus correcciones de texto.\n\n' +
            '¿Querés continuar? (Si solo querés cambiar el estilo visual sin tocar el texto, cancelá y usá Restablecer después de anotar los cambios.)'
        );
        if (!ok) return;
    }
    state.adminTemplate = nombre;
    document.querySelectorAll('#adminCVArea .tpl-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tpl === nombre);
    });
    // Solo cambia la clase visual si no hubo edición; si hubo y aceptó, regenera
    const preview = document.getElementById('adminCvPreview');
    if (state.adminEdited) {
        renderAdminCV();
    } else {
        // Regenerar siempre al cambiar plantilla para aplicar bien los estilos de cada template
        renderAdminCV();
    }
}

function adminDescargarPDF() {
    if (!state.currentSolicitud) return;
    const element = document.getElementById('adminCvPreview');
    const data = state.currentSolicitud;
    const nombreArchivo = `CV_${(data.nombre || 'Curriculum').replace(/\s+/g, '_')}.pdf`;

    // Quitar outline de edición temporalmente para el PDF
    const wasEditable = element.getAttribute('contenteditable');
    element.setAttribute('contenteditable', 'false');
    element.classList.add('pdf-exporting');

    const opt = {
        margin: [8, 8, 8, 8],
        filename: nombreArchivo,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    const btn = document.querySelector('#adminCVArea .cv-actions .btn-primary');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.textContent = 'Generando PDF...'; btn.disabled = true; }

    html2pdf().set(opt).from(element).save().then(() => {
        element.setAttribute('contenteditable', wasEditable || 'true');
        element.classList.remove('pdf-exporting');
        if (btn) { btn.textContent = originalText; btn.disabled = false; }
    }).catch(err => {
        console.error(err);
        element.setAttribute('contenteditable', wasEditable || 'true');
        element.classList.remove('pdf-exporting');
        alert('Error al generar el PDF.');
        if (btn) { btn.textContent = originalText; btn.disabled = false; }
    });
}

function adminEnviarWhatsApp() {
    if (!state.currentSolicitud) return;
    const data = state.currentSolicitud;
    let telefono = (data.telefono || '').replace(/\D/g, '');

    if (!telefono) {
        alert('No hay número de teléfono en esta solicitud.');
        return;
    }

    if (telefono.startsWith('54')) {
        // ok
    } else if (telefono.startsWith('9') && telefono.length >= 10) {
        telefono = '54' + telefono;
    } else if (telefono.startsWith('15')) {
        telefono = '549' + telefono.substring(2);
    } else if (telefono.length === 10) {
        telefono = '549' + telefono;
    } else {
        telefono = '54' + telefono;
    }

    const mensaje = encodeURIComponent(
        `Hola ${data.nombre || ''}! 👋\n\nTe enviamos tu Curriculum Vitae profesional generado por LBV RRHH.\n\nPor favor adjuntá el archivo PDF que descargaste.\n\n¡Saludos!`
    );

    // Descargar primero
    adminDescargarPDF();

    setTimeout(() => {
        window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
        alert(
            'Se descargó el PDF.\n\n' +
            'Se abrió WhatsApp con el contacto del cliente.\n' +
            'Adjuntá manualmente el archivo PDF en el chat.'
        );
    }, 1500);
}

function limpiarTodasSolicitudes() {
    if (!confirm('¿Seguro que querés eliminar TODAS las solicitudes? Esta acción no se puede deshacer.')) return;
    localStorage.removeItem(STORAGE_KEY);
    state.currentSolicitud = null;
    document.getElementById('adminCVArea').classList.add('hidden');
    document.getElementById('adminEmpty').classList.remove('hidden');
    cargarListaSolicitudes();
}

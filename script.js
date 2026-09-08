// LBV RRHH - Generador de CV
// Estado global de la aplicación

const state = {
    currentStep: 1,
    totalSteps: 6,
    photoData: null,
    comprobanteData: null,
    comprobanteName: null,
    experiencias: [],
    estudios: [],
    cursos: []
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Agregar una experiencia y un estudio por defecto
    addExperiencia();
    addEstudio();
    
    // Listeners de archivos
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
    document.getElementById('comprobanteInput').addEventListener('change', handleComprobanteUpload);
    
    updateProgress();
});

// Navegación entre pasos
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
        if (step === state.currentStep) {
            el.classList.add('active');
        } else if (step < state.currentStep) {
            el.classList.add('completed');
        }
    });
}

// Validaciones
function validateStep(step) {
    if (step === 1) {
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const puesto = document.getElementById('puesto').value.trim();
        
        if (!nombre || !email || !telefono || !puesto) {
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

// Foto
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
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = `<img src="${state.photoData}" alt="Foto de perfil">`;
    };
    reader.readAsDataURL(file);
}

// Comprobante de pago
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
        
        // Habilitar botón generar
        document.getElementById('btnGenerar').disabled = false;
    };
    reader.readAsDataURL(file);
}

// Experiencias laborales
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
                <label>Año / Período *</label>
                <input type="text" class="exp-anio" placeholder="Ej: 2020 - 2023 o 2022">
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
    document.querySelector(`.dynamic-item[data-id="${id}"]`).remove();
}

// Estudios
function addEstudio() {
    const id = Date.now() + Math.random();
    state.estudios.push({ id });
    
    const container = document.getElementById('estudiosContainer');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.dataset.id = id;
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeEstudio(${id})" title="Eliminar">×</button>
        <div class="item-grid">
            <div class="form-group">
                <label>Título / Carrera *</label>
                <input type="text" class="est-titulo" placeholder="Ej: Licenciatura en Administración">
            </div>
            <div class="form-group">
                <label>Establecimiento *</label>
                <input type="text" class="est-establecimiento" placeholder="Universidad / Instituto">
            </div>
            <div class="form-group">
                <label>Año / Período *</label>
                <input type="text" class="est-anio" placeholder="Ej: 2018 - 2022">
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

function removeEstudio(id) {
    if (state.estudios.length <= 1) {
        alert('Debe haber al menos un estudio (podés dejarlo vacío si no corresponde).');
        return;
    }
    state.estudios = state.estudios.filter(e => e.id !== id);
    document.querySelector(`.dynamic-item[data-id="${id}"]`).remove();
}

// Cursos
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
    document.querySelector(`.dynamic-item[data-id="${id}"]`).remove();
}

// Recolectar datos del formulario
function getFormData() {
    const experiencias = [];
    document.querySelectorAll('#experienciasContainer .dynamic-item').forEach(item => {
        const empresa = item.querySelector('.exp-empresa').value.trim();
        const puesto = item.querySelector('.exp-puesto').value.trim();
        const anio = item.querySelector('.exp-anio').value.trim();
        const tareas = item.querySelector('.exp-tareas').value.trim();
        if (empresa || puesto) {
            experiencias.push({ empresa, puesto, anio, tareas });
        }
    });
    
    const estudios = [];
    document.querySelectorAll('#estudiosContainer .dynamic-item').forEach(item => {
        const titulo = item.querySelector('.est-titulo').value.trim();
        const establecimiento = item.querySelector('.est-establecimiento').value.trim();
        const anio = item.querySelector('.est-anio').value.trim();
        const estado = item.querySelector('.est-estado').value;
        if (titulo || establecimiento) {
            estudios.push({ titulo, establecimiento, anio, estado });
        }
    });
    
    const cursos = [];
    document.querySelectorAll('#cursosContainer .dynamic-item').forEach(item => {
        const nombre = item.querySelector('.cur-nombre').value.trim();
        const institucion = item.querySelector('.cur-institucion').value.trim();
        const anio = item.querySelector('.cur-anio').value.trim();
        if (nombre) {
            cursos.push({ nombre, institucion, anio });
        }
    });
    
    // Habilidades: separar por comas o saltos de línea
    const habilidadesRaw = document.getElementById('habilidades').value.trim();
    const habilidades = habilidadesRaw
        ? habilidadesRaw.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
        : [];
    
    return {
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        ubicacion: document.getElementById('ubicacion').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        puesto: document.getElementById('puesto').value.trim(),
        resumen: document.getElementById('resumen').value.trim(),
        objetivo: document.getElementById('objetivo').value.trim(),
        idiomas: document.getElementById('idiomas').value.trim(),
        herramientas: document.getElementById('herramientas').value.trim(),
        habilidades,
        experiencias,
        estudios,
        cursos,
        photoData: state.photoData
    };
}

// Generar el CV
function generarCV() {
    if (!validateStep(5)) return;
    
    const data = getFormData();
    
    // Guardar en localStorage por si acaso
    try {
        localStorage.setItem('lbv_cv_data', JSON.stringify({
            ...data,
            photoData: null, // no guardar base64 grande
            comprobanteName: state.comprobanteName
        }));
    } catch (e) {}
    
    // Construir HTML del CV
    const cvHtml = buildCVHtml(data);
    document.getElementById('cvPreview').innerHTML = cvHtml;
    
    // Ir al paso 6
    document.getElementById('step5').classList.remove('active');
    state.currentStep = 6;
    document.getElementById('step6').classList.add('active');
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildCVHtml(data) {
    let photoHtml = '';
    if (data.photoData) {
        photoHtml = `<img src="${data.photoData}" alt="Foto" class="cv-photo">`;
    }
    
    let contactParts = [];
    if (data.email) contactParts.push(`<span>✉ ${data.email}</span>`);
    if (data.telefono) contactParts.push(`<span>📱 ${data.telefono}</span>`);
    if (data.ubicacion) contactParts.push(`<span>📍 ${data.ubicacion}</span>`);
    if (data.linkedin) contactParts.push(`<span>🔗 LinkedIn</span>`);
    
    let experienciasHtml = '';
    if (data.experiencias.length > 0) {
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
                            <div class="cv-item-date">${exp.anio || ''}</div>
                        </div>
                        ${exp.tareas ? `<div class="cv-item-desc">${exp.tareas}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    let estudiosHtml = '';
    if (data.estudios.length > 0) {
        estudiosHtml = `
            <div class="cv-section">
                <h2 class="cv-section-title">Formación Académica</h2>
                ${data.estudios.map(est => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div>
                                <div class="cv-item-title">${est.titulo || 'Título'}</div>
                                <div class="cv-item-subtitle">${est.establecimiento || ''} ${est.estado && est.estado !== 'Completo' ? `(${est.estado})` : ''}</div>
                            </div>
                            <div class="cv-item-date">${est.anio || ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    let cursosHtml = '';
    if (data.cursos.length > 0) {
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
    
    let habilidadesHtml = '';
    if (data.habilidades.length > 0) {
        habilidadesHtml = `
            <div class="cv-section">
                <h2 class="cv-section-title">Habilidades</h2>
                <div class="cv-skills-list">
                    ${data.habilidades.map(h => `<span class="cv-skill-tag">${h}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    let idiomasHtml = '';
    if (data.idiomas) {
        idiomasHtml = `
            <div class="cv-section">
                <h2 class="cv-section-title">Idiomas</h2>
                <div class="cv-item-desc">${data.idiomas}</div>
            </div>
        `;
    }
    
    let herramientasHtml = '';
    if (data.herramientas) {
        herramientasHtml = `
            <div class="cv-section">
                <h2 class="cv-section-title">Herramientas y Software</h2>
                <div class="cv-item-desc">${data.herramientas}</div>
            </div>
        `;
    }
    
    let resumenHtml = data.resumen ? `<div class="cv-resumen">${data.resumen}</div>` : '';
    
    // Adaptación según objetivo (simple)
    let estiloNota = '';
    const objLower = (data.objetivo || '').toLowerCase();
    if (objLower.includes('general') || objLower === 'general') {
        // estilo general ya aplicado
    } else if (objLower.length > 5) {
        estiloNota = `<p style="font-size:8pt;color:#718096;margin-bottom:0.75rem;font-style:italic;">CV orientado a: ${data.objetivo}</p>`;
    }
    
    return `
        ${estiloNota}
        <div class="cv-header">
            ${photoHtml}
            <div class="cv-header-info">
                <h1>${data.nombre || 'Nombre Completo'}</h1>
                <div class="cv-puesto">${data.puesto || ''}</div>
                <div class="cv-contact">${contactParts.join('')}</div>
            </div>
        </div>
        ${resumenHtml}
        ${experienciasHtml}
        ${estudiosHtml}
        ${cursosHtml}
        ${habilidadesHtml}
        ${idiomasHtml}
        ${herramientasHtml}
    `;
}

// Descargar PDF
function descargarPDF() {
    const element = document.getElementById('cvPreview');
    const data = getFormData();
    const nombreArchivo = `CV_${(data.nombre || 'Curriculum').replace(/\s+/g, '_')}.pdf`;
    
    const opt = {
        margin:       [8, 8, 8, 8],
        filename:     nombreArchivo,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // Mostrar indicador de carga
    const btn = event?.target || document.querySelector('.cv-actions .btn-primary');
    const originalText = btn ? btn.textContent : '';
    if (btn) {
        btn.textContent = 'Generando PDF...';
        btn.disabled = true;
    }
    
    html2pdf().set(opt).from(element).save().then(() => {
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }).catch(err => {
        console.error(err);
        alert('Hubo un error al generar el PDF. Intentá de nuevo.');
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

// Enviar por WhatsApp
function enviarWhatsApp() {
    const data = getFormData();
    let telefono = (data.telefono || '').replace(/\D/g, '');
    
    if (!telefono) {
        alert('No se encontró un número de teléfono en los datos personales.');
        return;
    }
    
    // Normalizar número argentino (si empieza con 0 o 15, etc.)
    if (telefono.startsWith('54')) {
        // ya tiene código de país
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
        `Hola ${data.nombre || ''}! 👋\n\nTe envío mi Curriculum Vitae generado con LBV RRHH.\n\nPor favor adjuntá el archivo PDF que descargaste.\n\n¡Gracias!`
    );
    
    // Primero descargar el PDF automáticamente
    descargarPDF();
    
    // Luego abrir WhatsApp después de un breve delay
    setTimeout(() => {
        const url = `https://wa.me/${telefono}?text=${mensaje}`;
        window.open(url, '_blank');
        
        alert(
            'Se descargó el PDF de tu CV.\n\n' +
            'Se abrió WhatsApp. Adjuntá manualmente el archivo PDF descargado en el chat.\n\n' +
            '(Los navegadores no permiten adjuntar archivos automáticamente por seguridad.)'
        );
    }, 1500);
}

// Volver a editar
function volverAEditar() {
    document.getElementById('step6').classList.remove('active');
    state.currentStep = 1;
    document.getElementById('step1').classList.add('active');
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

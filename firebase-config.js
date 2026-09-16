/**
 * LBV RRHH - Configuración Firebase
 *
 * 1) Creá un proyecto en https://console.firebase.google.com
 * 2) Agregá una app Web y copiá la config acá
 * 3) Activá Firestore (modo producción o prueba)
 * 4) Activá Storage
 * 5) Reglas: ver instrucciones al final de este archivo
 */
window.FIREBASE_CONFIG = {
  apiKey: "PEGAR_API_KEY",
  authDomain: "PEGAR_PROJECT_ID.firebaseapp.com",
  projectId: "PEGAR_PROJECT_ID",
  storageBucket: "PEGAR_PROJECT_ID.appspot.com",
  messagingSenderId: "PEGAR_SENDER_ID",
  appId: "PEGAR_APP_ID"
};

/** true cuando la config de arriba esté completa */
window.FIREBASE_ENABLED = !String(window.FIREBASE_CONFIG.apiKey || '').includes('PEGAR');

# Configurar Firebase para LBV RRHH

## 1. Crear proyecto
1. Entrá a https://console.firebase.google.com
2. **Agregar proyecto** → nombre ej. `lbv-rrhh`
3. Desactivá Analytics si no lo necesitás

## 2. App Web
1. Ícono **Web** (`</>`)
2. Apodo: `lbv-web`
3. Copiá el objeto `firebaseConfig`

## 3. Pegar config
Editá `firebase-config.js` y reemplazá los valores `PEGAR_...`:

```js
window.FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 4. Firestore
1. **Build → Firestore Database → Crear base de datos**
2. Modo **producción** (después ponés reglas)
3. Ubicación: la más cercana (ej. `southamerica-east1`)

### Reglas de prueba (solo para arrancar)
En **Reglas**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /solicitudes/{id} {
      allow read, write: if true;
    }
  }
}
```

⚠️ Cualquiera con la URL puede leer/escribir. Más adelante restringí con Auth.

## 5. Storage
1. **Build → Storage → Comenzar**
2. Reglas de prueba:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## 6. Publicar en GitHub Pages
Subí estos archivos al repo:
- `index.html`
- `script.js`
- `styles.css`
- `firebase-config.js`

URL: https://lbvrrhh389-cmyk.github.io/CurriculumsVitae/

## 7. Probar
1. Cliente: completar formulario y enviar
2. En la consola de Firebase → Firestore debería aparecer la colección `solicitudes`
3. Admin (cualquier dispositivo): misma URL → Acceso administración → `lbvadmin`

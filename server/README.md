# LBV RRHH – Backend Node.js

Sin dependencias externas (solo Node.js nativo).

## Requisitos
- Node.js 18+

## Ejecutar
```bash
cd server
npm start
# o: node server.js
```

Abrí: http://localhost:3000/index.html

## API
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/solicitudes | No | Guardar solicitud del cliente |
| GET | /api/solicitudes | `X-Admin-Key` | Listar solicitudes |
| GET | /api/solicitudes/:id | `X-Admin-Key` | Detalle |
| DELETE | /api/solicitudes/:id | `X-Admin-Key` | Borrar una |
| DELETE | /api/solicitudes | `X-Admin-Key` | Borrar todas |

Clave admin por defecto: **lbvadmin**  
(podés cambiarla con la variable de entorno `ADMIN_PASSWORD`)

## Datos
- Solicitudes: `server/data/solicitudes.json`
- Archivos: `server/uploads/`

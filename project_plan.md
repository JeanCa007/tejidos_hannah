# Tejidos Hannah — Plan de Proyecto

## 1. Descripción del Proyecto
Plataforma web de comercio y aprendizaje alrededor del tejido y las manualidades hechas a mano. Permite a Tejidos Hannah:

- Vender productos tejidos con carrito de compras, cálculo de envío y confirmación de pedido.
- Ofrecer cursos de manualidades con horarios, matrícula y agendamiento de citas.
- Compartir y vender patrones de tejido (algunos gratis, otros de pago).
- Administrar todo (inventario, pedidos, envíos, cursos, patrones, contenido) desde un panel privado.
- Editar contenido del sitio fácilmente, incluido el versículo bíblico del home.

**Público objetivo:** personas en Costa Rica (y región) que compran tejidos hechos a mano o quieren aprender a tejer. La marca se presenta con una identidad cálida, artesanal y cristiana.

**Moneda:** Colón costarricense (₡ CRC).

## 2. Estructura de Páginas

### Tienda pública (responsive, con barra inferior estilo app en móvil)
- `/` — Inicio (hero, versículo bíblico editable, destacados, cursos, patrones)
- `/tienda` — Catálogo de productos
- `/tienda/:id` — Detalle de producto
- `/cursos` — Catálogo de cursos
- `/cursos/:id` — Detalle de curso + horarios disponibles
- `/patrones` — Catálogo de patrones (gratis y de pago)
- `/patrones/:id` — Detalle de patrón
- `/carrito` — Carrito de compras
- `/checkout` — Finalizar compra (invitado o con cuenta)
- `/pedido/:id` — Confirmación / detalle de pedido
- `/agenda` — Agendar una cita (clase personalizada / consulta)
- `/matricula/:courseId` — Formulario de matrícula de curso
- `/nosotros` — Sobre Tejidos Hannah
- `/contacto` — Contacto
- `/preguntas-frecuentes` — Preguntas frecuentes (envíos, pagos, devoluciones, cursos/patrones)
- `/mi-cuenta` — Acceso del cliente (login/registro + resumen)
  - `/mi-cuenta/pedidos` — Historial de pedidos
  - `/mi-cuenta/cursos` — Mis cursos y matrículas
  - `/mi-cuenta/patrones` — Mis patrones

### Panel de administración (privado, en computadora)
- `/admin/login` — Acceso del administrador
- `/admin` — Dashboard (resumen de ventas, pedidos, matrículas)
- `/admin/productos` — Productos e inventario
- `/admin/pedidos` — Pedidos y estados
- `/admin/cursos` — Cursos y horarios
- `/admin/matriculas` — Matrículas de cursos
- `/admin/citas` — Citas agendadas
- `/admin/patrones` — Patrones (gratis / de pago)
- `/admin/clientes` — Clientes registrados
- `/admin/envios` — Configuración de envíos (zonas, costos, envío gratis)
- `/admin/contenido` — Versículo bíblico y textos del home
- `/admin/configuracion` — Configuración general del sitio (logo editable + datos de contacto)

## 3. Funcionalidades Principales
- [x] Catálogo de productos con categorías, imágenes, precio y stock
- [x] Carrito de compras y cálculo de envío por zona
- [x] Checkout para invitados y para clientes con cuenta
- [x] Página de Preguntas frecuentes (envíos, pagos, devoluciones y cursos)
- [ ] Pago en línea con pasarela local de Costa Rica (Tilopay) — tarjeta y SINPE Móvil
- [x] Confirmación de pedido y correo de notificación
- [x] Cursos con horarios (sesiones), cupos, matrícula y pago
- [x] Agendamiento de citas para clases personalizadas
- [x] Patrones: gratuitos (descarga) y de pago
- [x] Cuenta de cliente: registro, login, historial de pedidos, mis cursos y mis patrones
- [x] Panel de administración con control total (inventario, pedidos, envíos, cursos, patrones, clientes)
- [x] Home editable: versículo bíblico y sección de destacados administrables
- [x] Roles y permisos (administrador vs. cliente) — tabla `roles` + acceso único por rol

## 4. Diseño del Modelo de Datos (Supabase)

### roles
| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | text (PK) | 'customer' o 'admin' |
| label | text | Nombre visible del rol |
| description | text | Qué puede hacer el rol |
| created_at | timestamptz | Fecha de creación |

### profiles
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK, = auth.users.id) | Identificador del usuario |
| email | text | Correo |
| full_name | text | Nombre completo |
| phone | text | Teléfono |
| role | text (FK -> roles.name) | 'customer' (por defecto) o 'admin' |
| created_at | timestamptz | Fecha de registro |

> **Roles:** tabla `roles` con dos valores fijos: `customer` y `admin`. Todo usuario que se registra queda como `customer`; la cuenta administradora (`admin@tejidoshannah.com`) tiene rol `admin`. Un solo acceso (login normal) detecta el rol: si es admin entra al panel, si es cliente entra a la tienda.

### categories
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| name | text | Nombre de la categoría |
| slug | text | URL amigable |
| sort_order | int | Orden |

### products
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| name | text | Nombre |
| slug | text | URL amigable |
| description | text | Descripción |
| price | numeric | Precio (₡) |
| compare_price | numeric | Precio anterior (opcional) |
| stock | int | Inventario disponible |
| category_id | uuid (FK) | Categoría |
| image_url | text | Imagen principal |
| gallery | jsonb | Imágenes adicionales |
| is_active | boolean | Visible en tienda |
| created_at | timestamptz | Fecha de creación |

### orders
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| order_number | text | Número legible de pedido |
| user_id | uuid (FK, nullable) | Cliente (null si invitado) |
| customer_name | text | Nombre del cliente |
| email | text | Correo |
| phone | text | Teléfono |
| shipping_address | text | Dirección de envío |
| shipping_region | text | Zona de envío |
| subtotal | numeric | Subtotal |
| shipping_cost | numeric | Costo de envío |
| total | numeric | Total |
| status | text | 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled' |
| payment_method | text | Método de pago |
| payment_status | text | 'unpaid', 'paid', 'refunded' |
| created_at | timestamptz | Fecha del pedido |

### order_items
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| order_id | uuid (FK) | Pedido |
| product_id | uuid (FK) | Producto |
| name | text | Nombre al momento de la compra |
| price | numeric | Precio unitario |
| quantity | int | Cantidad |

### courses
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| title | text | Nombre del curso |
| slug | text | URL amigable |
| description | text | Descripción |
| price | numeric | Precio (₡) |
| level | text | Nivel (básico/intermedio/avanzado) |
| mode | text | Presencial / En línea |
| image_url | text | Imagen |
| is_active | boolean | Visible |
| created_at | timestamptz | Fecha de creación |

### course_sessions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| course_id | uuid (FK) | Curso |
| start_at | timestamptz | Inicio de la sesión/horario |
| end_at | timestamptz | Fin |
| capacity | int | Cupos disponibles |
| location | text | Lugar o enlace |
| is_active | boolean | Disponible |

### enrollments
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| course_id | uuid (FK) | Curso |
| session_id | uuid (FK, nullable) | Horario elegido |
| user_id | uuid (FK, nullable) | Cliente (null si invitado) |
| student_name | text | Nombre del estudiante |
| email | text | Correo |
| phone | text | Teléfono |
| status | text | 'pending', 'confirmed', 'cancelled' |
| payment_status | text | 'unpaid', 'paid' |
| created_at | timestamptz | Fecha |

### appointments
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| user_id | uuid (FK, nullable) | Cliente |
| name | text | Nombre |
| email | text | Correo |
| phone | text | Teléfono |
| service | text | Tipo de cita/tema |
| date | date | Fecha deseada |
| time_slot | text | Franja horaria |
| notes | text | Notas |
| status | text | 'pending', 'confirmed', 'cancelled' |
| created_at | timestamptz | Fecha |

### patterns
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| title | text | Nombre del patrón |
| slug | text | URL amigable |
| description | text | Descripción |
| type | text | 'free' o 'paid' |
| price | numeric | Precio (₡) si es de pago |
| difficulty | text | Dificultad |
| image_url | text | Imagen |
| file_url | text | Archivo/PDF del patrón |
| is_active | boolean | Visible |
| created_at | timestamptz | Fecha |

### pattern_purchases
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| pattern_id | uuid (FK) | Patrón |
| user_id | uuid (FK, nullable) | Cliente |
| order_id | uuid (FK, nullable) | Pedido asociado |
| created_at | timestamptz | Fecha |

### shipping_zones
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| name | text | Nombre de la zona |
| provinces | jsonb | Provincias/regiones incluidas |
| cost | numeric | Costo de envío |
| free_threshold | numeric | Monto para envío gratis (opcional) |
| estimated_days | text | Tiempo estimado |
| is_active | boolean | Activa |

### site_settings
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK) | Identificador |
| key | text | Clave (ej. 'bible_verse') |
| value | jsonb | Valor editable |
| updated_at | timestamptz | Última edición |

> **Seguridad:** todas las tablas con Row Level Security (RLS). Catálogo y ajustes públicos: lectura pública de registros activos. Pedidos/matrículas/citas: cada cliente ve solo lo suyo, administrador ve todo. Escritura de catálogo solo administrador.

## 5. Plan de Backend / Integraciones
- **Base de datos:** SaaS Supabase (ya conectado). Auth, base de datos y almacenamiento.
- **Pagos:** pasarela local de Costa Rica (Tilopay recomendada — tarjeta + SINPE Móvil) mediante Edge Functions. Las llaves de comercio se pedirán de forma segura en la fase de pagos. (Stripe no opera en Costa Rica.)
- **PayPal:** opcional más adelante como alternativa de pago.
- **Correos:** notificaciones de pedido/matrícula mediante una Edge Function (`send-email`) que hace un puente HTTPS a un **Google Apps Script** (Web App) que envía con el Gmail de la marca (`GmailApp.sendEmail`). Gratis, sin proveedor de pago ni SMTP. Requiere guardar en Supabase los secretos `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET` y `EMAIL_FROM_NAME`. (Supabase/Deno bloquea los puertos SMTP y no ofrece servicio propio de correos transaccionales; su correo nativo es solo para login/registro.)
- **Shopify:** no aplica (se usa catálogo propio en Supabase).
- **Citas:** módulo propio de agenda en Supabase; se puede complementar con la Agenda integrada si se desea.

## 6. Plan de Fases de Desarrollo

### Fase 1: Estructura base, sistema de diseño y Home
- Objetivo: montar la identidad visual (paleta cálida artesanal + tipografías), la estructura responsive con barra inferior estilo app, y el Home con versículo bíblico y secciones destacadas (datos de demostración).
- Entregable: Home responsive funcionando con navegación y contenido de muestra.

### Fase 2: Catálogo y carrito (interfaz)
- Objetivo: páginas de tienda, detalle de producto y carrito con interacciones completas (datos de demostración).
- Entregable: se puede navegar el catálogo, ver un producto y agregar/quitar del carrito.

### Fase 3: Base de datos, autenticación y roles
- Objetivo: crear el esquema en Supabase, conectar la app, registro/login de clientes y acceso del administrador.
- Acceso único: el login normal (Mi cuenta) detecta el rol. Las cuentas nuevas son `customer`; la cuenta `admin@tejidoshannah.com` es `admin` y va directo al panel.
- Entregable: clientes pueden crear cuenta; el administrador entra al panel con el mismo login.

### Fase 4: Pedidos, checkout y envíos
- Objetivo: checkout para invitados y clientes, cálculo de envío por zona y creación real de pedidos.
- Entregable: un cliente puede finalizar una compra y ver la confirmación.
- Estado: ✅ Checkout completo (datos de envío, zonas con costo/envío gratis, resumen y método de pago), creación real del pedido en la base de datos (`create_order`) y página de confirmación `/pedido/:id` (`get_order`). Pendiente: cobro en línea con Tilopay (Fase 8).

### Fase 5: Panel de administración — productos, pedidos, envíos
- Objetivo: CRUD de productos/inventario, gestión de pedidos y configuración de envíos.
- Entregable: el administrador administra catálogo, pedidos y zonas de envío.

### Fase 6: Módulo de cursos
- Objetivo: catálogo y detalle de cursos, horarios, matrícula y panel de cursos/matrículas.
- Entregable: se puede ver un curso, elegir horario y matricularse; el administrador gestiona cursos.

### Fase 7: Patrones y citas
- Objetivo: patrones gratis y de pago, y agendamiento de citas.
- Entregable: sección de patrones operativa y agenda de citas funcionando con su panel.

### Fase 8: Pagos, correos y contenido administrable
- Objetivo: integrar la pasarela local de Costa Rica, correos de notificación y edición del versículo/ textos del home desde el panel.
- Entregable: cobros en línea reales y contenido editable por la administradora.

### Fase 9: Cuenta del cliente y entrega de patrones
- Objetivo: activar la cuenta del cliente con datos reales y asegurar la entrega de patrones comprados.
- Entregable:
  - `Mis pedidos` (`/mi-cuenta/pedidos`): historial real de compras del cliente con detalle de productos y total. ✅
  - `Mis cursos` (`/mi-cuenta/cursos`): matrículas reales con su horario elegido. ✅
  - `Mis patrones` (`/mi-cuenta/patrones`): patrones comprados + gratuitos, con descarga del PDF. ✅
  - Matrícula de curso crea un registro real en `enrollments` con su `session_id` y actualiza el cupo (`create_enrollment`). ✅
  - Comprar un patrón de pago ya no rompe el checkout: se registra en `pattern_purchases` y queda disponible en `Mis patrones`. ✅
  - Las citas agendadas desde `/agenda` se reflejan en el panel `/admin/citas`. ✅
- Estado: ✅ completada.

### Fase 9.1: Ajustes de la cuenta del cliente
- Objetivo: pulir la experiencia de la cuenta y los datos de contacto.
- Entregable:
  - Editar nombre y teléfono desde "Mi cuenta" (autoedición de `profiles`). ✅
  - Correo en el formulario de Agenda, guardado en la cita (`appointments.email`). ✅
  - Contadores de pedidos, cursos y patrones en "Mi cuenta". ✅
- Estado: ✅ completada.

### Fase 9.2: Correos de notificación (Google Apps Script + Gmail)
- Objetivo: enviar correos automáticos de confirmación de pedido y de matrícula.
- Entregable:
  - Edge Function `send-email` que arma y envía el correo a través de un puente HTTPS hacia un Google Apps Script Web App (que envía con Gmail), verifica que el solicitante no dispare correos de otros usuarios y adjunta el detalle del pedido/matrícula. ✅
  - Se dispara automáticamente tras crear un pedido (checkout) y una matrícula. ✅
  - Copia del correo al negocio (bandeja del propietario) por cada pedido y matrícula nueva. La dirección se toma de `EMAIL_BUSINESS_TO` (secreto opcional) o, si no existe, del correo de contacto guardado en `site_settings` (clave `general`). ✅
  - Aviso al cliente en la página de confirmación (`/pedido`) de que el correo de confirmación fue enviado a su dirección. ✅
- Pendiente de configuración por la usuaria: crear el Apps Script con `GmailApp`, publicarlo como Web App y guardar `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET` y `EMAIL_FROM_NAME` en los secretos del proyecto en Supabase.
- Estado: ✅ código listo (esperando los secretos de Google).

### Fase 9.3: Logo editable desde el panel
- Objetivo: que la marca (logo) se pueda personalizar sin tocar código.
- Entregable:
  - Nueva sección "Logo" en `/admin/configuracion` con texto del logo, selector de ícono y subida de imagen (opcional) con vista previa. ✅
  - El logo se guarda en `site_settings` (clave `general`: `logoText`, `logoIcon`, `logoImageUrl`). ✅
  - Un proveedor compartido (`useSiteSettings` + componente `BrandLogo`) muestra el mismo logo en el encabezado, el pie y el panel, actualizándose al guardar. ✅
  - Si hay imagen, reemplaza al ícono + texto; si no, se usa el ícono elegido con el texto. ✅
- Estado: ✅ completada.

### Fase 10 (pendiente): Pagos en línea
- Pasarela local (Tilopay) para tarjeta y SINPE Móvil, enganchada al checkout existente.
- Correos de notificación ya implementados con Google Apps Script + Gmail (ver Fase 9.2).
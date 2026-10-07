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
- `/admin/configuracion` — Configuración general del sitio

## 3. Funcionalidades Principales
- [ ] Catálogo de productos con categorías, imágenes, precio y stock
- [ ] Carrito de compras y cálculo de envío por zona
- [ ] Checkout para invitados y para clientes con cuenta
- [ ] Pago en línea con pasarela local de Costa Rica (Tilopay) — tarjeta y SINPE Móvil
- [ ] Confirmación de pedido y correo de notificación
- [ ] Cursos con horarios (sesiones), cupos, matrícula y pago
- [ ] Agendamiento de citas para clases personalizadas
- [ ] Patrones: gratuitos (descarga) y de pago
- [ ] Cuenta de cliente: registro, login, historial de pedidos, mis cursos y mis patrones
- [ ] Panel de administración con control total (inventario, pedidos, envíos, cursos, patrones, clientes)
- [ ] Home editable: versículo bíblico y sección de destacados administrables
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
- **Correos:** notificaciones de pedido/matrícula (Resend) — fase posterior.
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
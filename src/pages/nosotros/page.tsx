import { Link } from "react-router-dom";

const values = [
  {
    icon: "ri-heart-3-line",
    title: "Hecho con amor",
    text: "Cada pieza se teje a mano, punto por punto, cuidando cada detalle.",
  },
  {
    icon: "ri-leaf-line",
    title: "Materiales de calidad",
    text: "Usamos hilos y lanas suaves, resistentes y agradables al tacto.",
  },
  {
    icon: "ri-book-open-line",
    title: "Compartimos lo que sabemos",
    text: "Enseñamos el arte del tejido con cursos y patrones para todas.",
  },
  {
    icon: "ri-heart-2-line",
    title: "Con fe y propósito",
    text: "Un emprendimiento cristiano que busca bendecir a cada hogar.",
  },
];

const stats = [
  { value: "500+", label: "Clientas felices" },
  { value: "6", label: "Cursos activos" },
  { value: "100%", label: "Hecho a mano" },
];

export default function NosotrosPage() {
  return (
    <div>
      <section className="grid items-center gap-8 py-4 lg:grid-cols-2 lg:gap-12">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
            Nuestra historia
          </span>
          <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight text-foreground-950 sm:text-4xl">
            Conoce Tejidos Hannah
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-foreground-600">
            Tejidos Hannah nació de una pasión sencilla: crear con las manos y
            compartir calidez. Lo que empezó como un pasatiempo se convirtió en
            un pequeño taller en Costa Rica donde cada pieza se teje con cariño
            y dedicación.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground-600">
            Hoy además de vender nuestros tejidos, enseñamos a otras personas a
            tejer y ofrecemos patrones para que creen sus propias obras. Creemos
            que crear algo con las manos es una forma de cuidar y bendecir a los
            demás.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/tienda"
              className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-shopping-bag-3-line text-lg" />
              Ver la tienda
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-6 py-3.5 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100"
            >
              <i className="ri-message-3-line text-lg" />
              Escríbenos
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-background-200/70">
          <img
            src="https://readdy.ai/api/search-image?query=A%20warm%20cozy%20artisan%20craft%20studio%20with%20handmade%20knitted%20baskets%20and%20yarn%20on%20wooden%20shelves%2C%20soft%20natural%20light%2C%20cream%20and%20terracotta%20tones%2C%20inviting%20handmade%20home%20atmosphere%2C%20editorial%20photography&width=1000&height=1000&seq=th-nosotros-01&orientation=squarish"
            alt="Taller de Tejidos Hannah"
            className="h-72 w-full object-cover object-top sm:h-96"
          />
        </div>
      </section>

      <section className="mt-10 grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-background-200/70 bg-background-100 px-4 py-6 text-center"
          >
            <span className="font-heading text-3xl font-bold text-primary-600">
              {stat.value}
            </span>
            <span className="mt-1 block text-xs font-semibold text-foreground-500">
              {stat.label}
            </span>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl font-semibold text-foreground-950 sm:text-3xl">
          Lo que nos mueve
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-background-200/70 bg-background-50 p-5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                <i className={`${value.icon} text-xl`} />
              </span>
              <h3 className="mt-4 text-sm font-bold text-foreground-900">
                {value.title}
              </h3>
              <p className="mt-1.5 text-sm text-foreground-600">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 flex flex-col items-center gap-5 rounded-[2rem] border border-background-200/70 bg-background-100 px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <i className="ri-hand-heart-line text-2xl" />
        </span>
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground-950">
            ¿Quieres algo hecho para ti?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-foreground-600">
            Hacemos piezas personalizadas y damos clases a tu medida. Cuéntanos
            tu idea y la tejemos juntas.
          </p>
        </div>
        <Link
          to="/agenda"
          className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-calendar-2-line text-lg" />
          Agendar una cita
        </Link>
      </section>
    </div>
  );
}
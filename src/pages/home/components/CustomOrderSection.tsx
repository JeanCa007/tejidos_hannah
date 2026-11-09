import { Link } from "react-router-dom";

const highlights = [
  { icon: "ri-palette-line", text: "Colores y lanas a tu gusto" },
  { icon: "ri-ruler-2-line", text: "Medidas hechas a tu espacio" },
  { icon: "ri-image-add-line", text: "Súbenos tus fotos de referencia" },
];

export default function CustomOrderSection() {
  return (
    <section className="py-8 lg:py-12">
      <div className="overflow-hidden rounded-[2rem] border border-background-200/70 bg-background-100">
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-0">
          <div className="order-2 px-6 pb-8 sm:px-10 lg:order-1 lg:py-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-accent-800">
              <i className="ri-hand-heart-line" />
              Hecho a tu medida
            </span>
            <h2 className="mt-4 font-heading text-2xl font-semibold text-foreground-950 sm:text-3xl">
              ¿Imaginas una pieza solo para ti?
            </h2>
            <p className="mt-3 max-w-md text-sm text-foreground-600">
              Cuéntanos la idea, el color, el tamaño y muéstranos tus fotos de
              referencia. Te preparamos una cotización sin compromiso.
            </p>

            <ul className="mt-5 space-y-2.5">
              {highlights.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-2.5 text-sm text-foreground-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background-50 text-primary-600">
                    <i className={`${item.icon} text-base`} />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>

            <Link
              to="/pedido-personalizado"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-edit-2-line text-lg" />
              Cotizar mi pedido
            </Link>
          </div>

          <div className="order-1 lg:order-2">
            <img
              src="https://readdy.ai/api/search-image?query=A%20hands-on%20crochet%20workspace%20with%20cream%20and%20terracotta%20yarn%20balls%2C%20a%20wooden%20crochet%20hook%20and%20a%20soft%20knitted%20blanket%20in%20progress%2C%20warm%20natural%20window%20light%2C%20artisanal%20handmade%20aesthetic%2C%20editorial%20photography%20on%20a%20simple%20neutral%20background&width=1000&height=800&seq=th-custom-home-01&orientation=landscape"
              alt="Pedido personalizado de tejido"
              className="h-56 w-full object-cover object-top sm:h-72 lg:h-full lg:min-h-[22rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
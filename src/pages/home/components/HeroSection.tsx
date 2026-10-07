import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { defaultHomeContent, fetchHomeContent, heroImage } from "@/lib/catalog";

export default function HeroSection() {
  const [hero, setHero] = useState(defaultHomeContent.hero);

  useEffect(() => {
    let active = true;
    fetchHomeContent()
      .then((content) => {
        if (active) setHero(content.hero);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="grid items-center gap-8 py-8 lg:grid-cols-2 lg:gap-12 lg:py-16">
      <div className="order-2 lg:order-1">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary-100 px-3 py-1.5 text-xs font-bold text-secondary-800">
          <i className="ri-leaf-line" />
          {hero.eyebrow}
        </span>
        <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight text-foreground-950 sm:text-5xl lg:text-6xl">
          {hero.title}
        </h1>
        <p className="mt-5 max-w-lg text-base text-foreground-600">{hero.subtitle}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/tienda"
            className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 shadow-soft transition-colors hover:bg-primary-600"
          >
            <i className="ri-shopping-bag-3-line text-lg" />
            Ver la tienda
          </Link>
          <Link
            to="/cursos"
            className="inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-6 py-3.5 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100"
          >
            <i className="ri-graduation-cap-line text-lg" />
            Explorar cursos
          </Link>
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <div className="relative overflow-hidden rounded-[2rem] shadow-soft">
          <img
            src={heroImage}
            alt="Piezas tejidas a mano por Tejidos Hannah"
            className="h-72 w-full object-cover object-top sm:h-96 lg:h-[30rem]"
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-background-50/90 p-3 backdrop-blur-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
              <i className="ri-award-line text-xl" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground-900">Más de 500 clientas felices</p>
              <p className="text-xs text-foreground-500">Tejidos personalizados con dedicación</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
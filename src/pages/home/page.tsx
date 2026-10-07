import { Link } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import TrustStrip from "./components/TrustStrip";
import VerseSection from "./components/VerseSection";
import FeaturedProducts from "./components/FeaturedProducts";
import CoursesSection from "./components/CoursesSection";
import PatternsSection from "./components/PatternsSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrustStrip />
      <VerseSection />
      <FeaturedProducts />
      <CoursesSection />
      <PatternsSection />

      <section className="py-8 lg:py-12">
        <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-background-200/70 bg-background-100 px-6 py-12 text-center sm:px-12">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <i className="ri-calendar-check-line text-2xl" />
          </span>
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground-950 sm:text-3xl">
              ¿Quieres una clase personalizada?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-foreground-600">
              Agenda una cita y aprendamos juntas a tu ritmo. También puedes
              escribirnos para pedidos personalizados.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/agenda"
              className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-calendar-2-line text-lg" />
              Agendar una cita
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 rounded-full border border-background-300 bg-background-50 px-6 py-3.5 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100"
            >
              <i className="ri-message-3-line text-lg" />
              Escribirnos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
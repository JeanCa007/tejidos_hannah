import { Outlet, Link } from "react-router-dom";
import StoreHeader from "./StoreHeader";
import BottomNav from "./BottomNav";

export default function StoreLayout() {
  return (
    <div className="min-h-screen bg-background-50">
      <StoreHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-16 sm:px-6 lg:px-8 lg:pb-16">
        <Outlet />
      </main>

      <footer className="hidden border-t border-background-200/70 bg-background-100 lg:block">
        <div className="mx-auto grid max-w-7xl grid-cols-4 gap-8 px-8 py-12">
          <div className="col-span-2">
            <span
              className="text-2xl text-foreground-950"
              style={{ fontFamily: '"Pacifico", serif' }}
            >
              Tejidos Hannah
            </span>
            <p className="mt-3 max-w-sm text-sm text-foreground-600">
              Piezas tejidas a mano con amor en Costa Rica, cursos de manualidades
              y patrones para que crees tus propias obras.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background-50 text-foreground-600 transition-colors hover:bg-primary-100 hover:text-primary-700"
              >
                <i className="ri-instagram-line text-lg" />
              </a>
              <a
                href="https://wa.me/50600000000"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background-50 text-foreground-600 transition-colors hover:bg-primary-100 hover:text-primary-700"
              >
                <i className="ri-whatsapp-line text-lg" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background-50 text-foreground-600 transition-colors hover:bg-primary-100 hover:text-primary-700"
              >
                <i className="ri-facebook-circle-line text-lg" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground-900">Tienda</h4>
            <ul className="mt-3 space-y-2 text-sm text-foreground-600">
              <li>
                <Link to="/tienda" className="hover:text-primary-600">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/cursos" className="hover:text-primary-600">
                  Cursos
                </Link>
              </li>
              <li>
                <Link to="/patrones" className="hover:text-primary-600">
                  Patrones
                </Link>
              </li>
              <li>
                <Link to="/agenda" className="hover:text-primary-600">
                  Agendar cita
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground-900">Ayuda</h4>
            <ul className="mt-3 space-y-2 text-sm text-foreground-600">
              <li>
                <Link to="/nosotros" className="hover:text-primary-600">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-primary-600">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/mi-cuenta" className="hover:text-primary-600">
                  Mi cuenta
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="hover:text-primary-600">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background-200/70 py-5 text-center text-xs text-foreground-500">
          © {new Date().getFullYear()} Tejidos Hannah · Hecho con amor en Costa Rica
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
import { NavLink } from "react-router-dom";
import { bottomNav } from "./navConfig";
import { useCart } from "@/hooks/useCart";

export default function BottomNav() {
  const { count } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-background-200/70 bg-background-50/90 backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-5 px-0 pb-[env(safe-area-inset-bottom)]">
        {bottomNav.map((item) => {
          const isCart = item.path === "/carrito";
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                  isActive ? "text-primary-600" : "text-foreground-500"
                }`
              }
            >
              <span className="relative flex h-6 w-6 items-center justify-center">
                <i className={`${item.icon} text-xl`} />
                {isCart && count > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-accent-950">
                    {count}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
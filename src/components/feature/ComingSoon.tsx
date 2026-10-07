import { Link } from "react-router-dom";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: string;
}

export default function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600">
        <i className={`${icon} text-3xl`} />
      </span>
      <h1 className="mt-6 font-heading text-3xl font-semibold text-foreground-950">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm text-foreground-600">{description}</p>
      <span className="mt-5 rounded-full bg-accent-100 px-4 py-1.5 text-xs font-bold text-accent-800">
        Próximamente
      </span>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
      >
        <i className="ri-arrow-left-line" />
        Volver al inicio
      </Link>
    </section>
  );
}
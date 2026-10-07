import { useEffect, useState } from "react";
import { defaultHomeContent, fetchHomeContent } from "@/lib/catalog";

export default function VerseSection() {
  const [verse, setVerse] = useState(defaultHomeContent.verse);

  useEffect(() => {
    let active = true;
    fetchHomeContent()
      .then((content) => {
        if (active) setVerse(content.verse);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-8 lg:py-12">
      <div className="relative overflow-hidden rounded-[2rem] bg-secondary-500 px-6 py-12 text-center sm:px-12 lg:py-16">
        <i className="ri-double-quotes-l absolute left-6 top-6 text-6xl text-secondary-300/40" />
        <i className="ri-double-quotes-r absolute bottom-6 right-6 text-6xl text-secondary-300/40" />
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-50/15 text-secondary-50">
          <i className="ri-book-open-line text-2xl" />
        </span>
        <p className="mx-auto mt-6 max-w-2xl font-heading text-2xl font-medium italic leading-snug text-secondary-50 sm:text-3xl">
          “{verse.text}”
        </p>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-secondary-100">
          {verse.reference}
        </p>
      </div>
    </section>
  );
}
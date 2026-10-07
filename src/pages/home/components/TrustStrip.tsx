import { useEffect, useState } from "react";
import { defaultHomeContent, fetchHomeContent } from "@/lib/catalog";

export default function TrustStrip() {
  const [features, setFeatures] = useState(defaultHomeContent.trust);

  useEffect(() => {
    let active = true;
    fetchHomeContent()
      .then((content) => {
        if (active) setFeatures(content.trust);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-[2rem] border border-background-200/70 bg-background-100 px-4 py-6 sm:px-8 lg:py-8">
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background-50 text-primary-600 shadow-card">
              <i className={`${feature.icon} text-xl`} />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground-900">{feature.title}</p>
              <p className="mt-0.5 text-xs text-foreground-500">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[2rem] border border-background-200/70 bg-background-100">
        <img
          src={images[active]}
          alt={name}
          className="aspect-square w-full object-cover object-top"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1} de ${name}`}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors ${
                active === index
                  ? "border-primary-500"
                  : "border-background-200 hover:border-primary-300"
              }`}
            >
              <img
                src={image}
                alt={`${name} vista ${index + 1}`}
                className="h-full w-full object-cover object-top"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
import type { Category } from "@/lib/storeTypes";

interface CategoryChipsProps {
  categories: Category[];
  active: string;
  onChange: (categoryId: string) => void;
}

export default function CategoryChips({ categories, active, onChange }: CategoryChipsProps) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
          active === "all"
            ? "border-primary-500 bg-primary-500 text-background-50"
            : "border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100"
        }`}
      >
        <i className="ri-apps-2-line" />
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onChange(category.id)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
            active === category.id
              ? "border-primary-500 bg-primary-500 text-background-50"
              : "border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100"
          }`}
        >
          <i className={category.icon || "ri-price-tag-3-line"} />
          {category.name}
        </button>
      ))}
    </div>
  );
}
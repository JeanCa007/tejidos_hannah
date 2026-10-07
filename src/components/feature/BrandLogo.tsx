import { useSiteSettings } from "@/hooks/useSiteSettings";

interface BrandLogoProps {
  className?: string;
  iconBoxClassName?: string;
  textClassName?: string;
  imageClassName?: string;
  subtitle?: string;
}

export default function BrandLogo({
  className = "flex items-center gap-2",
  iconBoxClassName = "flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-background-50",
  textClassName = "text-xl text-foreground-950",
  imageClassName = "h-9 w-auto max-w-[180px] object-contain",
  subtitle,
}: BrandLogoProps) {
  const { settings } = useSiteSettings();
  const label = settings.logoText?.trim() || "Tejidos Hannah";

  if (settings.logoImageUrl) {
    return (
      <span className={className}>
        <img src={settings.logoImageUrl} alt={label} className={imageClassName} />
      </span>
    );
  }

  return (
    <span className={className}>
      <span className={iconBoxClassName}>
        <i className={`${settings.logoIcon || "ri-goblet-line"} text-lg`} />
      </span>
      {subtitle ? (
        <span className="leading-tight">
          <span
            className={`block ${textClassName}`}
            style={{ fontFamily: '"Pacifico", serif' }}
          >
            {label}
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-wide text-foreground-400">
            {subtitle}
          </span>
        </span>
      ) : (
        <span className={textClassName} style={{ fontFamily: '"Pacifico", serif' }}>
          {label}
        </span>
      )}
    </span>
  );
}
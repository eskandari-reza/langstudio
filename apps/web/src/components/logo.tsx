import { LOGO_MARK } from "@/lib/art-data";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: LOGO_MARK }}
    />
  );
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2" dir="ltr">
      <LogoMark size={size} />
      <span className="font-display text-2xl leading-none tracking-wide">langstudio Lab</span>
    </span>
  );
}

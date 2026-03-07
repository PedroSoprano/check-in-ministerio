import Image from "next/image";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

const defaultWidth = 160;
const defaultHeight = 56;

export function Logo({ className = "", width = defaultWidth, height = defaultHeight, priority }: LogoProps) {
  return (
    <Image
      src="/images/logo-nova-igreja-batista-tabernaculo.png"
      alt="Nova Igreja Batista Tabernáculo"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority={priority}
    />
  );
}

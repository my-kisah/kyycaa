import { cn } from "@/lib/utils";

type FlexibleImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
};

export function FlexibleImage({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  loading = "lazy",
}: FlexibleImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={cn(
        fill ? "absolute inset-0 h-full w-full" : "",
        className,
      )}
    />
  );
}

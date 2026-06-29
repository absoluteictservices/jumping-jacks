import Image from "next/image";

const GRADIENTS = [
  "from-brand-pink to-brand-yellow",
  "from-brand-sky to-brand-violet",
  "from-brand-violet to-brand-pink",
  "from-brand-green to-brand-sky",
  "from-brand-yellow to-brand-pink",
];

/**
 * Renders the first image for an inflatable, or a friendly colourful placeholder
 * (with the castle name) when no photo has been uploaded yet.
 */
export function CastleImage({
  name,
  images,
  index = 0,
  className = "",
  priority = false,
}: {
  name: string;
  images: string[];
  index?: number;
  className?: string;
  priority?: boolean;
}) {
  const src = images?.[0];
  if (src) {
    return (
      <Image
        src={src}
        alt={`${name} bouncy castle for hire in Leeds`}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className={`object-cover ${className}`}
        priority={priority}
      />
    );
  }
  const grad = GRADIENTS[index % GRADIENTS.length];
  return (
    <div
      role="img"
      aria-label={`${name} bouncy castle`}
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${grad} ${className}`}
    >
      <div className="dotty absolute inset-0 opacity-40" />
      <span className="relative px-4 text-center font-display text-2xl font-extrabold text-white drop-shadow">
        {name}
      </span>
    </div>
  );
}

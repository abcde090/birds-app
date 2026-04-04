import type { FlyingBird as FlyingBirdType } from "../../types/game";
import { BIRD_SIZE_DESKTOP, BIRD_SIZE_MOBILE } from "../../lib/game-config";

interface Props {
  bird: FlyingBirdType;
  onClick: (birdId: string, x: number, y: number) => void;
}

export default function FlyingBird({ bird, onClick }: Props) {
  const size = window.innerWidth >= 768 ? BIRD_SIZE_DESKTOP : BIRD_SIZE_MOBILE;
  const rotation = bird.direction === 1 ? 5 : -5;

  return (
    <button
      className="absolute cursor-pointer border-none bg-transparent p-0"
      style={{
        transform: `translate(${bird.x - size / 2}px, ${bird.y - size / 2}px) rotate(${rotation}deg)`,
        width: size,
        height: size,
        willChange: "transform",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(bird.id, e.clientX, e.clientY);
      }}
      aria-label={`Catch ${bird.species.commonName}`}
    >
      <img
        src={bird.species.imageUrl}
        alt={bird.species.commonName}
        className="h-full w-full rounded-full object-cover"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
        draggable={false}
      />
    </button>
  );
}

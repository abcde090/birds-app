import type { FlightPattern } from "../types/game";

interface Viewport {
  width: number;
  height: number;
}

interface FlightEndpoints {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function generateFlightEndpoints(
  pattern: FlightPattern,
  direction: 1 | -1,
  viewport: Viewport,
): FlightEndpoints {
  const margin = 100;
  const enterX = direction === 1 ? -margin : viewport.width + margin;
  const exitX = direction === 1 ? viewport.width + margin : -margin;
  const minY = 60;
  const maxY = viewport.height - 100;

  switch (pattern) {
    case "straight": {
      const y = minY + Math.random() * (maxY - minY);
      return { startX: enterX, startY: y, endX: exitX, endY: y };
    }
    case "arc": {
      const startY = maxY - Math.random() * (maxY - minY) * 0.3;
      const endY = startY;
      return { startX: enterX, startY, endX: exitX, endY };
    }
    case "dive": {
      const startY = minY + Math.random() * (maxY - minY) * 0.3;
      const endY = maxY - Math.random() * (maxY - minY) * 0.2;
      return { startX: enterX, startY, endX: exitX, endY };
    }
    case "zigzag": {
      const y = minY + Math.random() * (maxY - minY);
      return { startX: enterX, startY: y, endX: exitX, endY: y };
    }
  }
}

export function interpolatePosition(
  pattern: FlightPattern,
  progress: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  time: number,
): { x: number; y: number } {
  const t = progress;
  const baseX = startX + (endX - startX) * t;
  const baseY = startY + (endY - startY) * t;
  const bob = Math.sin(time * 3) * 4;

  switch (pattern) {
    case "straight":
      return { x: baseX, y: baseY + bob };
    case "arc": {
      const arcHeight = -120 * Math.sin(t * Math.PI);
      return { x: baseX, y: baseY + arcHeight + bob };
    }
    case "dive":
      return { x: baseX, y: baseY + bob };
    case "zigzag": {
      const zigzag = Math.sin(t * Math.PI * 3) * 60;
      return { x: baseX, y: baseY + zigzag + bob };
    }
  }
}

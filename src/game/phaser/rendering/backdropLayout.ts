export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;

export function backdropExtent(levelWidth: number, levelHeight: number, factorX: number, factorY: number) {
  return {
    width: VIEW_WIDTH + Math.max(0, levelWidth - VIEW_WIDTH) * factorX + 2,
    height: VIEW_HEIGHT + Math.max(0, levelHeight - VIEW_HEIGHT) * factorY + 2,
  };
}

export function coverScale(imageWidth: number, imageHeight: number, width: number, height: number): number {
  if (imageWidth <= 0 || imageHeight <= 0) throw new Error('Backdrop dimensions must be positive.');
  return Math.max(width / imageWidth, height / imageHeight);
}

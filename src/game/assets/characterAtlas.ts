import type Phaser from 'phaser';
import { TextureKeys } from './manifest';

export const ELIAS_ATLAS = { width: 320, height: 300, footY: 289, columns: 6, rows: 5 } as const;

export function prepareProductionElias(scene: Phaser.Scene): boolean {
  if (!scene.textures.exists(TextureKeys.eliasProductionSource)) return false;
  const source = scene.textures.get(TextureKeys.eliasProductionSource).getSourceImage() as HTMLImageElement;
  const read = document.createElement('canvas');
  read.width = source.width;
  read.height = source.height;
  const context = read.getContext('2d', { willReadFrequently: true });
  if (!context) return false;
  context.drawImage(source, 0, 0);
  const pixels = context.getImageData(0, 0, read.width, read.height).data;
  const boundaries = [0, Math.round(read.height * 0.336), Math.round(read.height * 0.648), read.height];
  const rects = Array.from({ length: 3 }, (_, row) => Array.from({ length: 6 }, (_, column) => {
    const left = Math.round(column * read.width / 6);
    const right = Math.round((column + 1) * read.width / 6);
    let minX = right, minY = boundaries[row + 1], maxX = left, maxY = boundaries[row];
    for (let y = boundaries[row]; y < boundaries[row + 1]; y += 1) {
      for (let x = left; x < right; x += 1) {
        if (pixels[(y * read.width + x) * 4 + 3] < 24) continue;
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
    }
    return { x: minX, y: minY, width: Math.max(1, maxX - minX + 1), height: Math.max(1, maxY - minY + 1) };
  }));
  // One scale for every pose preserves anatomy; feet are aligned, never per-frame stretched.
  const scale = 232 / Math.max(...rects[0].map((rect) => rect.height));
  const atlas = document.createElement('canvas');
  atlas.width = ELIAS_ATLAS.width * ELIAS_ATLAS.columns;
  atlas.height = ELIAS_ATLAS.height * ELIAS_ATLAS.rows;
  const target = atlas.getContext('2d');
  if (!target) return false;
  target.imageSmoothingEnabled = true;
  const place = (row: number, column: number, sourceRow: number, sourceColumn: number) => {
    const rect = rects[sourceRow][sourceColumn];
    const width = rect.width * scale, height = rect.height * scale;
    target.drawImage(read, rect.x, rect.y, rect.width, rect.height,
      column * ELIAS_ATLAS.width + (ELIAS_ATLAS.width - width) / 2,
      row * ELIAS_ATLAS.height + ELIAS_ATLAS.footY - height, width, height);
  };
  for (let column = 0; column < 6; column += 1) {
    place(0, column, 0, column);
    place(1, column, 1, column);
    place(4, column, 2, 5);
  }
  [1, 2, 2, 3, 4].forEach((column, index) => place(3, index, 2, column));
  if (scene.textures.exists(TextureKeys.eliasSheet)) scene.textures.remove(TextureKeys.eliasSheet);
  scene.textures.addCanvas(TextureKeys.eliasSheet, atlas);
  return true;
}

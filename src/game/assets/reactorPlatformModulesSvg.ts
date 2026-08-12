import type { PlatformVisualFamily, TimelineKey } from '../types';

type Theme = {
  face: string;
  face2: string;
  edge: string;
  accent: string;
  dark: string;
  bolt: string;
};

const themes: Record<TimelineKey, Theme> = {
  past: {
    face: '#50351f',
    face2: '#2d2117',
    edge: '#b77d35',
    accent: '#e5ad57',
    dark: '#100c09',
    bolt: '#d1a25e',
  },
  present: {
    face: '#172932',
    face2: '#0d171d',
    edge: '#397f91',
    accent: '#53c9df',
    dark: '#05090c',
    bolt: '#79929b',
  },
  future: {
    face: '#2b151d',
    face2: '#160a0f',
    edge: '#7c304d',
    accent: '#d35682',
    dark: '#070305',
    bolt: '#7f5f62',
  },
};

const svg = (body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="96" viewBox="0 0 128 96">${body}</svg>`;

export function reactorPlatformModuleSvg(family: PlatformVisualFamily, timeline: TimelineKey): string {
  if (family === 'reactor-catwalk') return catwalk(timeline);
  if (family === 'reactor-gantry') return gantry(timeline);
  if (family === 'reactor-machine') return machineHousing(timeline);
  return heavyFloor(timeline);
}

function commonTop(theme: Theme, y = 10, height = 14): string {
  return `
    <rect x="1" y="${y}" width="126" height="${height}" rx="2" fill="${theme.face}" stroke="${theme.edge}" stroke-width="2"/>
    <rect x="3" y="${y + 2}" width="122" height="4" fill="${theme.accent}" opacity=".78"/>
    <path d="M10 ${y + height - 3}h108" stroke="${theme.dark}" stroke-width="2" opacity=".75"/>
    <g fill="${theme.bolt}"><circle cx="10" cy="${y + 8}" r="1.7"/><circle cx="118" cy="${y + 8}" r="1.7"/></g>`;
}

function timelineDamage(timeline: TimelineKey, yTop: number, yBottom: number): string {
  if (timeline !== 'future') return '';
  return `
    <path d="M83 ${yTop}l8 8-5 8 10 9-8 12 7 ${Math.min(yBottom, yTop + 42)}" fill="none" stroke="#e05a8a" stroke-width="2" opacity=".62"/>
    <path d="M108 ${yTop - 1}h19v17l-7-3-6 6-6-3z" fill="#050204" opacity=".92"/>`;
}

function heavyFloor(timeline: TimelineKey): string {
  const t = themes[timeline];
  return svg(`
    ${commonTop(t, 8, 17)}
    <rect x="5" y="25" width="118" height="47" fill="${t.face2}" stroke="${t.edge}" stroke-width="2"/>
    <path d="M12 31h104v33H12z" fill="none" stroke="${t.edge}" stroke-width="1.5" opacity=".46"/>
    <path d="M12 64 38 31M38 64 64 31M64 64 90 31M90 64 116 31" stroke="${t.edge}" stroke-width="3" opacity=".26"/>
    <rect x="18" y="39" width="34" height="17" rx="2" fill="${t.dark}" stroke="${t.edge}" opacity=".92"/>
    <rect x="76" y="39" width="34" height="17" rx="2" fill="${t.dark}" stroke="${t.edge}" opacity=".92"/>
    <path d="M8 72h112l-12 14H20z" fill="${t.dark}" stroke="${t.edge}" stroke-width="2"/>
    <g fill="${t.bolt}" opacity=".78"><circle cx="12" cy="68" r="2"/><circle cx="116" cy="68" r="2"/></g>
    ${timelineDamage(timeline, 12, 72)}
  `);
}

function catwalk(timeline: TimelineKey): string {
  const t = themes[timeline];
  return svg(`
    ${commonTop(t, 8, 15)}
    <rect x="5" y="23" width="118" height="13" fill="${t.face2}" stroke="${t.edge}" stroke-width="2"/>
    <path d="M9 36 34 74h17L76 36M51 74l25-38 25 38h17" fill="none" stroke="${t.edge}" stroke-width="5" opacity=".72"/>
    <path d="M12 45h104" stroke="${t.edge}" stroke-width="2" opacity=".28"/>
    <rect x="18" y="27" width="92" height="4" fill="${t.dark}" opacity=".82"/>
    ${timelineDamage(timeline, 10, 68)}
  `);
}

function gantry(timeline: TimelineKey): string {
  const t = themes[timeline];
  return svg(`
    ${commonTop(t, 9, 16)}
    <rect x="5" y="25" width="118" height="16" fill="${t.face2}" stroke="${t.edge}" stroke-width="2"/>
    <path d="M12 42 39 83M39 83 64 42M64 42l25 41M89 83l27-41" fill="none" stroke="${t.edge}" stroke-width="5" opacity=".76"/>
    <path d="M9 9V1M119 9V1" stroke="${t.edge}" stroke-width="6"/>
    <path d="M9 1h22M97 1h22" stroke="${t.accent}" stroke-width="2" opacity=".56"/>
    <circle cx="64" cy="33" r="5" fill="${t.dark}" stroke="${t.accent}" stroke-width="2"/>
    ${timelineDamage(timeline, 11, 80)}
  `);
}

function machineHousing(timeline: TimelineKey): string {
  const t = themes[timeline];
  return svg(`
    ${commonTop(t, 6, 18)}
    <rect x="4" y="24" width="120" height="64" rx="4" fill="${t.face2}" stroke="${t.edge}" stroke-width="2.5"/>
    <path d="M12 32h104v48H12z" fill="${t.face}" stroke="${t.edge}" stroke-width="1.5" opacity=".82"/>
    <circle cx="34" cy="56" r="15" fill="${t.dark}" stroke="${t.edge}" stroke-width="3"/>
    <circle cx="34" cy="56" r="6" fill="none" stroke="${t.accent}" stroke-width="2" opacity=".72"/>
    <path d="M63 40h42M63 49h42M63 58h42M63 67h42" stroke="${t.dark}" stroke-width="5"/>
    <path d="M66 40h31" stroke="${t.accent}" stroke-width="1" opacity=".28"/>
    <g fill="${t.bolt}"><circle cx="10" cy="82" r="2"/><circle cx="118" cy="82" r="2"/></g>
    ${timelineDamage(timeline, 9, 84)}
  `);
}

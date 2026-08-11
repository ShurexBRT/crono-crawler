import type { TimelineKey } from '../types';

type BackgroundTheme = {
  edge: string;
  accent: string;
  dark: string;
  skyTop: string;
  skyBottom: string;
  buildings: [string, string, string];
};

const themes: Record<TimelineKey, BackgroundTheme> = {
  past: {
    edge: '#cc8e3d',
    accent: '#f0b75a',
    dark: '#27190e',
    skyTop: '#170e08',
    skyBottom: '#71421d',
    buildings: ['#21160d', '#2e1e10', '#392615'],
  },
  present: {
    edge: '#37bcd4',
    accent: '#65d8ef',
    dark: '#07141b',
    skyTop: '#02070d',
    skyBottom: '#153748',
    buildings: ['#071018', '#0a1720', '#0c1e29'],
  },
  future: {
    edge: '#b82c5f',
    accent: '#e04f82',
    dark: '#190910',
    skyTop: '#0b0409',
    skyBottom: '#471126',
    buildings: ['#10070d', '#180910', '#220b16'],
  },
};

export function backgroundSvgDataUri(source: string): string {
  return `data:image/svg+xml;base64,${btoa(source)}`;
}

export function reactorFarSvg(timeline: TimelineKey): string {
  const theme = themes[timeline];
  const buildings = Array.from({ length: 18 }, (_, index) => {
    const x = -40 + index * 118;
    const height = 220 + ((index * 83) % 260);
    const width = 82 + ((index * 31) % 55);
    const y = 650 - height;
    const cap = 30 + ((index * 13) % 45);
    const windows = Array.from({ length: Math.max(3, Math.floor(height / 70)) }, (_, row) =>
      Array.from({ length: Math.max(2, Math.floor(width / 28)) }, (_, column) =>
        (column + row + index) % 3 === 0
          ? ''
          : `<rect x="${x + 16 + column * 23}" y="${y + 54 + row * 48}" width="5" height="14"/>`,
      ).join(''),
    ).join('');
    const fill = theme.buildings[index % theme.buildings.length];
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/><path d="M${x} ${y}h${width}l${-width / 2} ${-cap}z" fill="${fill}"/><g fill="${theme.accent}" opacity=".22">${windows}</g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="720" viewBox="0 0 1920 720">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${theme.skyTop}"/><stop offset="1" stop-color="${theme.skyBottom}"/></linearGradient></defs>
  <rect width="1920" height="720" fill="url(#sky)"/>
  <circle cx="1510" cy="155" r="85" fill="${theme.accent}" opacity=".09"/>
  <path d="M210 650 520 0h90L320 650zM1230 650 1450 0h85l-180 650z" fill="${theme.accent}" opacity=".07"/>
  ${buildings}
  <rect y="610" width="1920" height="110" fill="#020406" opacity=".55"/>
  </svg>`;
}

export function reactorMidSvg(timeline: TimelineKey): string {
  const theme = themes[timeline];
  const crack =
    timeline === 'future'
      ? `<path d="M965 120l-35 80 30 44-55 120 39 80-42 115" stroke="#e15388" stroke-width="8" fill="none" opacity=".65"/>`
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="720" viewBox="0 0 1920 720">
  <defs><filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <g opacity=".9">
    <path d="M0 590h1920" stroke="${theme.edge}" stroke-width="5" opacity=".25"/>
    <g fill="${theme.dark}" stroke="${theme.edge}" stroke-width="3" opacity=".75">
      <rect x="90" y="260" width="150" height="360"/><rect x="310" y="190" width="110" height="430"/>
      <rect x="1490" y="220" width="130" height="400"/><rect x="1700" y="300" width="120" height="320"/>
    </g>
    <g fill="none" stroke="${theme.edge}" stroke-width="8" opacity=".45">
      <path d="M70 370h410M1440 390h430"/><path d="M180 210v430M370 160v480M1550 180v460M1760 260v380"/>
    </g>
  </g>
  <g transform="translate(960 335)" fill="#05090c" stroke="${theme.edge}">
    <circle r="220" stroke-width="20" opacity=".7"/><circle r="170" stroke-width="12" opacity=".75"/><circle r="112" stroke-width="9" opacity=".85"/>
    <circle r="55" fill="${theme.edge}" opacity=".2" stroke-width="5"/><circle r="18" fill="${theme.accent}" filter="url(#glow)"/>
    <path d="M-220 0h440M0-220v440M-155-155 155 155M155-155-155 155" stroke-width="5" opacity=".45"/>
  </g>
  ${crack}
  <g stroke="${theme.edge}" stroke-width="4" opacity=".45">
    <path d="M0 545h620l90-55h500l90 55h620"/><path d="M80 545v90M360 545v90M680 520v115M1220 520v115M1540 545v90M1830 545v90"/>
  </g>
  </svg>`;
}

export function reactorForegroundSvg(): string {
  const cables = Array.from({ length: 9 }, (_, index) => {
    const x = -60 + index * 240;
    return `<path d="M${x} 0q80 ${120 + (x % 110)} 160 0"/>`;
  }).join('');
  const chains = Array.from({ length: 6 }, (_, index) => {
    const x = 150 + index * 340;
    return `<path d="M${x} 0v${120 + (x % 180)}"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="720" viewBox="0 0 1920 720">
  <g fill="none" stroke="#010204" stroke-width="18" opacity=".88">${cables}${chains}<path d="M0 640h420l130-90h300M1920 620h-390l-120-80h-260"/></g>
  <g fill="#010204" opacity=".82"><rect x="0" y="0" width="55" height="720"/><rect x="1865" y="0" width="55" height="720"/><path d="M0 510h210v210H0zM1710 500h210v220h-210z"/></g>
  </svg>`;
}

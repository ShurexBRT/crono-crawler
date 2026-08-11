import type { TimelineKey } from '../types';

type Theme = { edge: string; accent: string; face: string; dark: string };

const themes: Record<TimelineKey, Theme> = {
  past: { edge: '#d29b4a', accent: '#f0b75a', face: '#5e3d1c', dark: '#26170d' },
  present: { edge: '#48cce2', accent: '#8cf1ff', face: '#182b33', dark: '#071116' },
  future: { edge: '#d94b7c', accent: '#f06b98', face: '#32151f', dark: '#12070c' },
};

const defs = `<defs>
<linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#33444c"/><stop offset=".45" stop-color="#0b1116"/><stop offset="1" stop-color="#202f35"/></linearGradient>
<linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0b55a"/><stop offset=".35" stop-color="#7b5127"/><stop offset=".72" stop-color="#d19a4c"/><stop offset="1" stop-color="#3a2617"/></linearGradient>
<linearGradient id="cyan" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c7fbff"/><stop offset=".4" stop-color="#38d9f2"/><stop offset="1" stop-color="#0b4c60"/></linearGradient>
<linearGradient id="amber" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff0b3"/><stop offset=".45" stop-color="#f0a64d"/><stop offset="1" stop-color="#6b3a13"/></linearGradient>
<filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;

function svg(width: number, height: number, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}${body}</svg>`;
}

export function svgDataUri(source: string): string {
  return `data:image/svg+xml;base64,${btoa(source)}`;
}

export function temporalAnchorSvg(): string {
  return svg(192, 256, `<g stroke-linejoin="round">
<ellipse cx="96" cy="231" rx="64" ry="15" fill="#030608" opacity=".55"/>
<path d="M45 220h102l-8 18H53z" fill="url(#steel)" stroke="#a97939" stroke-width="4"/>
<rect x="56" y="70" width="80" height="150" rx="10" fill="url(#steel)" stroke="#8f632f" stroke-width="4"/>
<rect x="67" y="87" width="58" height="90" rx="18" fill="#061116" stroke="#2b7280" stroke-width="3"/>
<rect x="73" y="93" width="46" height="78" rx="14" fill="url(#cyan)" opacity=".26"/>
<circle cx="96" cy="136" r="31" fill="#071015" stroke="url(#brass)" stroke-width="7"/>
<circle cx="96" cy="136" r="20" fill="#06202a" stroke="#42e5f5" stroke-width="4" filter="url(#glow)"/>
<circle cx="96" cy="136" r="7" fill="#d9fbff" filter="url(#glow)"/>
<path d="M96 109v54M69 136h54M77 117l38 38M115 117l-38 38" stroke="#8bdce7" stroke-width="2" opacity=".65"/>
<path d="M65 74l8-22h46l8 22M78 52l5-18h26l5 18M89 34l7-22 7 22" fill="url(#steel)" stroke="#a97939" stroke-width="3"/>
<path d="M47 195h98M51 204h90" stroke="#c28a42" stroke-width="3" opacity=".8"/>
</g>`);
}

export function memoryFragmentSvg(): string {
  return svg(128, 160, `<g filter="url(#glow)">
<path d="M64 8 101 48 84 136 61 154 31 121 23 48z" fill="url(#amber)" stroke="#ffe0a0" stroke-width="3"/>
<path d="M64 8 61 154M23 48h78M31 121l53 15M64 8 31 121M101 48 61 154" fill="none" stroke="#ffecc3" stroke-width="2" opacity=".55"/>
<path d="M23 48 64 82 101 48M31 121 64 82 84 136" fill="none" stroke="#53e3f3" stroke-width="2" opacity=".7"/>
<circle cx="64" cy="82" r="9" fill="#fff3b5"/>
</g>`);
}

export function rustmiteSvg(phase: 0 | 1 | 2, alert = false): string {
  const shift = [-3, 0, 4][phase];
  const eye = alert ? '#ff294f' : '#ff654d';
  return svg(128, 96, `<ellipse cx="64" cy="85" rx="44" ry="6" fill="#020406" opacity=".55"/>
<g fill="none" stroke="#7d5b35" stroke-width="6" stroke-linecap="round">
<path d="M42 58 23 ${76 + shift} 9 ${84 - shift}"/><path d="M50 65 34 ${83 - shift} 25 91"/>
<path d="M86 58 105 ${76 - shift} 119 ${84 + shift}"/><path d="M78 65 94 ${83 + shift} 103 91"/>
</g>
<g fill="url(#steel)" stroke="#a0713c" stroke-width="3"><ellipse cx="64" cy="51" rx="37" ry="25"/><circle cx="37" cy="50" r="14"/><circle cx="91" cy="50" r="14"/></g>
<path d="M42 31 50 18h28l10 13" fill="url(#brass)" stroke="#9c713c" stroke-width="3"/>
<circle cx="64" cy="48" r="17" fill="#090a0b" stroke="#b47b3c" stroke-width="5"/>
<circle cx="64" cy="48" r="8" fill="${eye}" ${alert ? 'filter="url(#glow)"' : ''}/><circle cx="62" cy="45" r="2" fill="#fff" opacity=".85"/>
<path d="M51 72 44 84 53 80M77 72 84 84 75 80" fill="#9b713e" stroke="#1c1210" stroke-width="2"/>`);
}

export function platformSvg(timeline: TimelineKey): string {
  const t = themes[timeline];
  const broken = timeline === 'future' ? `<path d="M90 22l18 15 12-10 20 16M356 26l19 14 10-9 28 17" stroke="#f06a95" stroke-width="3" fill="none"/><path d="M430 18h54v36h-19l-12-13-23 5z" fill="#060408"/>` : '';
  return svg(512, 96, `<path d="M8 18h496v38H8z" fill="${t.face}" stroke="${t.edge}" stroke-width="4"/>
<path d="M10 18h492v8H10z" fill="${t.accent}" opacity=".8"/>
<path d="M26 56 60 92h30L118 56M150 56l28 36h26l30-36M278 56l30 36h26l28-36M405 56l28 36h28l26-36" fill="none" stroke="${t.edge}" stroke-width="6" opacity=".62"/>
<g fill="${t.dark}" stroke="${t.edge}" stroke-width="2"><rect x="42" y="32" width="72" height="12"/><rect x="150" y="32" width="72" height="12"/><rect x="258" y="32" width="72" height="12"/><rect x="366" y="32" width="72" height="12"/></g>${broken}`);
}

export function doorSvg(timeline: TimelineKey): string {
  const t = themes[timeline];
  const broken = timeline === 'future' ? `<path d="M148 30l-16 44 16 24-18 44 12 65" fill="none" stroke="#f06b98" stroke-width="5"/>` : '';
  return svg(192, 288, `<path d="M25 264V95Q25 24 96 18q71 6 71 77v169z" fill="${t.face}" stroke="${t.edge}" stroke-width="7"/>
<path d="M42 264V100q0-52 54-58 54 6 54 58v164" fill="#06090b" stroke="${t.edge}" stroke-width="4"/>
<path d="M53 85h86M45 125h102M42 210h108" stroke="${t.edge}" stroke-width="3" opacity=".7"/>
<circle cx="96" cy="150" r="31" fill="#071015" stroke="${t.edge}" stroke-width="7"/><circle cx="96" cy="150" r="13" fill="${t.accent}" filter="url(#glow)"/>
<path d="M96 118v64M64 150h64" stroke="${t.accent}" stroke-width="3"/>${broken}`);
}

export function plateSvg(timeline: TimelineKey): string {
  const t = themes[timeline];
  return svg(160, 48, `<ellipse cx="80" cy="31" rx="70" ry="13" fill="#030507" opacity=".55"/>
<path d="M12 20 26 8h108l14 12-10 19H22z" fill="${t.dark}" stroke="${t.edge}" stroke-width="4"/>
<path d="M34 19h92v8H34z" fill="${t.edge}" opacity=".62"/><circle cx="80" cy="23" r="10" fill="none" stroke="${t.edge}" stroke-width="3"/>`);
}

export function switchSvg(timeline: TimelineKey, on: boolean): string {
  const t = themes[timeline];
  const handleX = on ? 66 : 34;
  return svg(96, 128, `<ellipse cx="48" cy="116" rx="35" ry="7" fill="#030507" opacity=".5"/>
<path d="M18 108V54q0-18 30-23 30 5 30 23v54z" fill="${t.dark}" stroke="${t.edge}" stroke-width="4"/>
<rect x="26" y="68" width="44" height="25" rx="4" fill="#071015" stroke="${t.edge}" stroke-width="3"/>
<path d="M48 68 ${handleX} 30" stroke="${t.edge}" stroke-width="7" stroke-linecap="round"/><circle cx="${handleX}" cy="30" r="7" fill="#efe7d1" stroke="${t.edge}" stroke-width="3"/>
<circle cx="48" cy="82" r="7" fill="${t.accent}" filter="url(#glow)" opacity="${on ? '.95' : '.35'}"/>`);
}

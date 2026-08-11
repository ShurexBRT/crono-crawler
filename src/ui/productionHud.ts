import { UIManager } from './UIManager';
import type { TimelineKey } from '../game/types';
import './productionHud.css';

type HudState = {
  levelTitle: string;
  objective: string;
  timeline: TimelineKey;
  checkpoint: string;
  ghostLabel: string;
  ghostProgress: number;
};

type PatchedUi = {
  hudLayer: HTMLElement;
};

(UIManager.prototype as unknown as { showHud: (state: HudState) => void }).showHud = function productionHud(
  this: PatchedUi,
  state: HudState,
): void {
  this.hudLayer.innerHTML = `
    <div class="hud-v2" data-hud-shell>
      <section class="hud-v2-objective" aria-label="Current objective">
        <span class="hud-v2-kicker">Objective</span>
        <strong data-hud="objective">${escapeHtml(state.objective)}</strong>
      </section>

      <section class="hud-v2-level level-chip" aria-label="Level and checkpoint">
        <span>${escapeHtml(state.levelTitle)}</span>
        <small data-hud="checkpoint">${escapeHtml(state.checkpoint)}</small>
      </section>

      <section data-hud="timeline-card" class="hud-v2-instrument timeline-${state.timeline}" aria-label="Timeline instrument">
        <div class="hud-v2-gauntlet" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="hud-v2-rail" aria-hidden="true">
          <span class="hud-v2-node node-past">1</span>
          <span class="hud-v2-track"></span>
          <span class="hud-v2-node node-present">2</span>
          <span class="hud-v2-track"></span>
          <span class="hud-v2-node node-future">3</span>
        </div>
        <div class="hud-v2-timeline-copy">
          <small>Q · Shift Timeline</small>
          <strong data-hud="timeline">${timelineName(state.timeline)}</strong>
        </div>
        <div class="hud-v2-echo">
          <span>Echo</span>
          <strong data-hud="ghost">${escapeHtml(state.ghostLabel)}</strong>
          <span class="hud-v2-echo-meter"><i data-hud="ghost-progress" style="width:${Math.round(state.ghostProgress * 100)}%"></i></span>
        </div>
      </section>
    </div>
  `;
};

function timelineName(timeline: TimelineKey): string {
  if (timeline === 'past') return 'Past';
  if (timeline === 'future') return 'Ruined Future';
  return 'Present';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

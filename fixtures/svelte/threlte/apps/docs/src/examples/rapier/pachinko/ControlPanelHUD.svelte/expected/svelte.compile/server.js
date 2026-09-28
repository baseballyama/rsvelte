import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { HTML } from '@threlte/extras';

import {
	CABINET_WIDTH,
	CONTROL_PANEL_HEIGHT,
	CONTROL_PANEL_TILT,
	CONTROL_PANEL_Y,
	gameState
} from './gameState.svelte';

export default function ControlPanelHUD($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const pocketLabel = {
			'': '',
			low: '+10',
			mid: '+25',
			high: '+50',
			jackpot: 'JACKPOT +250'
		};

		const panelHalfW = CABINET_WIDTH / 2;
		const panelCenterY = -CONTROL_PANEL_HEIGHT / 2;
		const cardScale = 0.6;
		const cardZ = 0.26;

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position: [0, CONTROL_PANEL_Y, 0],
				rotation: [CONTROL_PANEL_TILT, 0, 0],
				children: ($$renderer) => {
					HTML($$renderer, {
						transform: true,
						position: [-panelHalfW + 1.7, panelCenterY, cardZ],
						scale: cardScale,
						children: ($$renderer) => {
							$$renderer.push(`<div class="score-card svelte-k1v5oq"><div class="score-label svelte-k1v5oq">Score</div> <div class="score-value svelte-k1v5oq">${$.escape(gameState.score.toLocaleString())}</div> `);

							if (gameState.lastPocketHit) {
								$$renderer.push(`<!--[0--><div${$.attr_class('last-hit svelte-k1v5oq', void 0, { 'jackpot': gameState.lastPocketHit === 'jackpot' })}${$.attr('data-hit', gameState.lastPocketHit + gameState.score)}>${$.escape(pocketLabel[gameState.lastPocketHit])}</div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					HTML($$renderer, {
						transform: true,
						position: [panelHalfW - 1.9, panelCenterY, cardZ],
						scale: cardScale,
						children: ($$renderer) => {
							$$renderer.push(`<div class="power svelte-k1v5oq"><div class="power-label svelte-k1v5oq">`);

							if (gameState.autoFiring) {
								$$renderer.push(`<!--[0--><span class="autofire svelte-k1v5oq">AUTO-FIRE</span>`);
							} else if (gameState.holding) {
								$$renderer.push(`<!--[1-->Charging…`);
							} else {
								$$renderer.push(`<!--[-1-->Hold <kbd class="svelte-k1v5oq">Space</kbd>`);
							}

							$$renderer.push(`<!--]--></div> <div class="power-bar svelte-k1v5oq"><div${$.attr_class('power-fill svelte-k1v5oq', void 0, { 'max': gameState.charge >= 1 })}${$.attr_style('', { width: `${gameState.charge * 100}%` })}></div></div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}
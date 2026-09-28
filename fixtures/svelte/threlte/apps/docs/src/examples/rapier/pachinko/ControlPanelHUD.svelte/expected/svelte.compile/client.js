import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { HTML } from '@threlte/extras';

import {
	CABINET_WIDTH,
	CONTROL_PANEL_HEIGHT,
	CONTROL_PANEL_TILT,
	CONTROL_PANEL_Y,
	gameState
} from './gameState.svelte';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div class="score-card svelte-k1v5oq"><div class="score-label svelte-k1v5oq">Score</div> <div class="score-value svelte-k1v5oq"> </div> <!></div>`);
var root_2 = $.from_html(`<span class="autofire svelte-k1v5oq">AUTO-FIRE</span>`);
var root_3 = $.from_html(`Hold <kbd class="svelte-k1v5oq">Space</kbd>`, 1);
var root_4 = $.from_html(`<div class="power svelte-k1v5oq"><div class="power-label svelte-k1v5oq"><!></div> <div class="power-bar svelte-k1v5oq"><div></div></div></div>`);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function ControlPanelHUD($$anchor, $$props) {
	$.push($$props, true);

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
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [0, CONTROL_PANEL_Y, 0]);
		let $1 = $.derived(() => [CONTROL_PANEL_TILT, 0, 0]);

		$.component(node, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get position() {
					return $.get($0);
				},

				get rotation() {
					return $.get($1);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_5();
					var node_1 = $.first_child(fragment_1);

					{
						let $0 = $.derived(() => [-panelHalfW + 1.7, panelCenterY, cardZ]);

						HTML(node_1, {
							transform: true,
							get position() {
								return $.get($0);
							},
							scale: cardScale,
							children: ($$anchor, $$slotProps) => {
								var div = root_1();
								var div_1 = $.sibling($.child(div), 2);
								var text = $.only_child(div_1, true);
								var node_2 = $.sibling(div_1, 2);

								{
									var consequent = ($$anchor) => {
										var div_2 = root();
										let classes;
										var text_1 = $.only_child(div_2, true);

										$.template_effect(() => {
											classes = $.set_class(div_2, 1, 'last-hit svelte-k1v5oq', null, classes, { jackpot: gameState.lastPocketHit === 'jackpot' });
											$.set_attribute(div_2, 'data-hit', gameState.lastPocketHit + gameState.score);
											$.set_text(text_1, pocketLabel[gameState.lastPocketHit]);
										});

										$.append($$anchor, div_2);
									};

									$.if(node_2, ($$render) => {
										if (gameState.lastPocketHit) $$render(consequent);
									});
								}

								$.reset(div);
								$.template_effect(($0) => $.set_text(text, $0), [() => gameState.score.toLocaleString()]);
								$.append($$anchor, div);
							},
							$$slots: { default: true }
						});
					}

					var node_3 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => [panelHalfW - 1.9, panelCenterY, cardZ]);

						HTML(node_3, {
							transform: true,
							get position() {
								return $.get($0);
							},
							scale: cardScale,
							children: ($$anchor, $$slotProps) => {
								var div_3 = root_4();
								var div_4 = $.child(div_3);
								var node_4 = $.child(div_4);

								{
									var consequent_1 = ($$anchor) => {
										var span = root_2();

										$.append($$anchor, span);
									};

									var consequent_2 = ($$anchor) => {
										var text_2 = $.text('Charging…');

										$.append($$anchor, text_2);
									};

									var alternate = ($$anchor) => {
										var fragment_2 = root_3();

										$.next();
										$.append($$anchor, fragment_2);
									};

									$.if(node_4, ($$render) => {
										if (gameState.autoFiring) $$render(consequent_1); else if (gameState.holding) $$render(consequent_2, 1); else $$render(alternate, -1);
									});
								}

								$.reset(div_4);

								var div_5 = $.sibling(div_4, 2);
								var div_6 = $.child(div_5);
								let classes_1;
								let styles;

								$.reset(div_5);
								$.reset(div_3);

								$.template_effect(() => {
									classes_1 = $.set_class(div_6, 1, 'power-fill svelte-k1v5oq', null, classes_1, { max: gameState.charge >= 1 });
									styles = $.set_style(div_6, '', styles, { width: `${gameState.charge * 100}%` });
								});

								$.append($$anchor, div_3);
							},
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
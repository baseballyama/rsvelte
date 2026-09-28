import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { Edges, Text } from '@threlte/extras';
import { cubicIn, cubicOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';
import { game } from './Game.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function GUI($$anchor, $$props) {
	$.push($$props, true);

	let mainUiTexts = $.derived(() => {
		if (game.state === 'game-over') return {
			text: `Game Over\nScore: ${game.score}`,
			size: { width: 7, height: 2.5 }
		};

		if (game.state === 'menu') return {
			text: 'Press Space\nto Start',
			size: { width: 7.5, height: 2.5 }
		};

		if (game.state === 'level-complete') return {
			text: `Level ${game.levelIndex + 1} Complete\nScore: ${game.score}`,
			size: { width: 10, height: 2.5 }
		};

		return undefined;
	});

	const scale = new Tween(0);

	$.user_effect(() => {
		const inAnim = !!$.get(mainUiTexts);

		scale.set(inAnim ? 0.8 : 0, { easing: inAnim ? cubicIn : cubicOut });
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get scale() {
				return scale.current;
			},
			'position.y': 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.key(
					node_1,
					() => `${[
						($.get(mainUiTexts)?.size.width ?? 6.5).toString(),
						($.get(mainUiTexts)?.size.height ?? 2.5).toString()
					].join('')}`,
					($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => -90 * MathUtils.DEG2RAD);

							$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
								T_Mesh($$anchor, {
									get 'rotation.x'() {
										return $.get($0);
									},
									'position.y': 0.8,
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										{
											let $0 = $.derived(() => [
												$.get(mainUiTexts)?.size.width ?? 6.5,
												$.get(mainUiTexts)?.size.height ?? 2.5
											]);

											$.component(node_3, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
												T_PlaneGeometry($$anchor, {
													get args() {
														return $.get($0);
													}
												});
											});
										}

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
											T_MeshBasicMaterial($$anchor, { color: '#08060a' });
										});

										var node_5 = $.sibling(node_4, 2);

										Edges(node_5, {
											get color() {
												return game.baseColor;
											},
											scale: 1.01
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_2);
					}
				);

				var node_6 = $.sibling(node_1, 2);

				{
					var consequent = ($$anchor) => {
						{
							let $0 = $.derived(() => MathUtils.DEG2RAD * -90);
							let $1 = $.derived(() => $.get(mainUiTexts)?.text);

							Text($$anchor, {
								font: '/fonts/beefd.ttf',
								get 'rotation.x'() {
									return $.get($0);
								},
								anchorX: '50%',
								anchorY: '50%',
								textAlign: 'center',
								fontSize: 0.4,
								lineHeight: 2,
								get color() {
									return game.baseColor;
								},
								'position.y': 1,
								get text() {
									return $.get($1);
								}
							});
						}
					};

					$.if(node_6, ($$render) => {
						if ($.get(mainUiTexts)?.text) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => -90 * MathUtils.DEG2RAD);

		Text(node_7, {
			font: '/fonts/beefd.ttf',
			get 'rotation.x'() {
				return $.get($0);
			},
			anchorX: '50%',
			anchorY: '50%',
			textAlign: 'center',
			fontSize: 0.3,
			get color() {
				return game.baseColor;
			},
			position: [-4.56, 1, -3.4],
			text: 'LVL'
		});
	}

	var node_8 = $.sibling(node_7, 2);

	{
		let $0 = $.derived(() => -90 * MathUtils.DEG2RAD);
		let $1 = $.derived(() => (game.levelIndex + 1).toString());

		Text(node_8, {
			get 'rotation.x'() {
				return $.get($0);
			},
			anchorX: '50%',
			anchorY: '0%',
			textAlign: 'center',
			font: '/fonts/beefd.ttf',
			lineHeight: 1.4,
			fontSize: 0.7,
			get color() {
				return game.baseColor;
			},
			position: [-4.56, 1, -3],
			get text() {
				return $.get($1);
			}
		});
	}

	var node_9 = $.sibling(node_8, 2);

	{
		let $0 = $.derived(() => -90 * MathUtils.DEG2RAD);

		Text(node_9, {
			get 'rotation.x'() {
				return $.get($0);
			},
			anchorX: '50%',
			anchorY: '50%',
			textAlign: 'center',
			fontSize: 0.3,
			font: '/fonts/beefd.ttf',
			get color() {
				return game.baseColor;
			},
			position: [4.56, 1, -3.4],
			text: 'SCR'
		});
	}

	var node_10 = $.sibling(node_9, 2);

	{
		let $0 = $.derived(() => -90 * MathUtils.DEG2RAD);
		let $1 = $.derived(() => game.score.toString());

		Text(node_10, {
			get 'rotation.x'() {
				return $.get($0);
			},
			anchorX: '50%',
			anchorY: '0%',
			lineHeight: 1.4,
			font: '/fonts/beefd.ttf',
			textAlign: 'center',
			fontSize: 0.7,
			get color() {
				return game.baseColor;
			},
			position: [4.56, 1, -3],
			get text() {
				return $.get($1);
			}
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
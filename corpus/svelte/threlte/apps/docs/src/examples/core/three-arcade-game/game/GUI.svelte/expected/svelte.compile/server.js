import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { Edges, Text } from '@threlte/extras';
import { cubicIn, cubicOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';
import { game } from './Game.svelte';

export default function GUI($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				scale: scale.current,
				'position.y': 2,
				children: ($$renderer) => {
					$$renderer.push(`<!---->`);

					{
						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								'rotation.x': -90 * MathUtils.DEG2RAD,
								'position.y': 0.8,
								children: ($$renderer) => {
									if (T.PlaneGeometry) {
										$$renderer.push('<!--[-->');

										T.PlaneGeometry($$renderer, {
											args: [
												mainUiTexts()?.size.width ?? 6.5,
												mainUiTexts()?.size.height ?? 2.5
											]
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshBasicMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshBasicMaterial($$renderer, { color: '#08060a' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);
									Edges($$renderer, { color: game.baseColor, scale: 1.01 });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!----> `);

					if (mainUiTexts()?.text) {
						$$renderer.push('<!--[0-->');

						Text($$renderer, {
							font: '/fonts/beefd.ttf',
							'rotation.x': MathUtils.DEG2RAD * -90,
							anchorX: '50%',
							anchorY: '50%',
							textAlign: 'center',
							fontSize: 0.4,
							lineHeight: 2,
							color: game.baseColor,
							'position.y': 1,
							text: mainUiTexts()?.text
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Text($$renderer, {
			font: '/fonts/beefd.ttf',
			'rotation.x': -90 * MathUtils.DEG2RAD,
			anchorX: '50%',
			anchorY: '50%',
			textAlign: 'center',
			fontSize: 0.3,
			color: game.baseColor,
			position: [-4.56, 1, -3.4],
			text: 'LVL'
		});

		$$renderer.push(`<!----> `);

		Text($$renderer, {
			'rotation.x': -90 * MathUtils.DEG2RAD,
			anchorX: '50%',
			anchorY: '0%',
			textAlign: 'center',
			font: '/fonts/beefd.ttf',
			lineHeight: 1.4,
			fontSize: 0.7,
			color: game.baseColor,
			position: [-4.56, 1, -3],
			text: (game.levelIndex + 1).toString()
		});

		$$renderer.push(`<!----> `);

		Text($$renderer, {
			'rotation.x': -90 * MathUtils.DEG2RAD,
			anchorX: '50%',
			anchorY: '50%',
			textAlign: 'center',
			fontSize: 0.3,
			font: '/fonts/beefd.ttf',
			color: game.baseColor,
			position: [4.56, 1, -3.4],
			text: 'SCR'
		});

		$$renderer.push(`<!----> `);

		Text($$renderer, {
			'rotation.x': -90 * MathUtils.DEG2RAD,
			anchorX: '50%',
			anchorY: '0%',
			lineHeight: 1.4,
			font: '/fonts/beefd.ttf',
			textAlign: 'center',
			fontSize: 0.7,
			color: game.baseColor,
			position: [4.56, 1, -3],
			text: game.score.toString()
		});

		$$renderer.push(`<!---->`);
	});
}
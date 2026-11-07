import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { Audio, Edges, Text } from '@threlte/extras';
import { Tween } from 'svelte/motion';
import { useTimeout } from '../hooks/useTimeout.svelte';
import { useArcadeControls } from '../controls.svelte';
import { game } from '../Game.svelte';
import ThrelteLogo from '../objects/ThrelteLogo.svelte';

export default function Outro($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { timeout } = useTimeout();
		const controls = useArcadeControls();
		const left = controls.action('left');
		const right = controls.action('right');
		let direction = 1;
		const logoScale = new Tween(0);

		timeout(
			() => {
				logoScale.set(1);
			},
			1.5e3
		);

		const textScale = new Tween(0);
		const textRotation = new Tween(10);

		timeout(
			() => {
				textScale.set(1);
				textRotation.set(0);
			},
			200
		);

		let showPressSpaceToStart = false;
		let blinkClock = 0;

		timeout(
			() => {
				showPressSpaceToStart = true;
			},
			5e3
		);

		Audio($$renderer, { src: '/audio/arcade_intro.mp3', loop: true, autoplay: true });
		$$renderer.push(`<!----> `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'position.z': -0.35,
				children: ($$renderer) => {
					ThrelteLogo($$renderer, { positionZ: -1.2, direction });
					$$renderer.push(`<!----> `);

					if (T.Group) {
						$$renderer.push('<!--[-->');

						T.Group($$renderer, {
							scale: textScale.current,
							'position.z': 1.3,
							'rotation.x': MathUtils.degToRad(-90),
							'rotation.z': textRotation,
							children: ($$renderer) => {
								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										'position.y': -0.05,
										children: ($$renderer) => {
											if (T.PlaneGeometry) {
												$$renderer.push('<!--[-->');
												T.PlaneGeometry($$renderer, { args: [11, 2] });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (T.MeshBasicMaterial) {
												$$renderer.push('<!--[-->');
												T.MeshBasicMaterial($$renderer, { transparent: true, opacity: 0 });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);
											Edges($$renderer, { color: game.baseColor });
											$$renderer.push(`<!---->`);
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
									anchorX: '50%',
									anchorY: '50%',
									textAlign: 'center',
									fontSize: 0.5,
									color: game.baseColor,
									text: `THRELTE MASTER\nSCORE ${game.score}`
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (showPressSpaceToStart) {
			$$renderer.push('<!--[0-->');

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					scale: textScale.current,
					'position.z': 3.3,
					'rotation.x': MathUtils.degToRad(-90),
					visible: !!blinkClock,
					children: ($$renderer) => {
						Text($$renderer, {
							font: '/fonts/beefd.ttf',
							anchorX: '50%',
							anchorY: '50%',
							textAlign: 'center',
							fontSize: 0.35,
							color: game.baseColor,
							text: 'PRESS SPACE TO RESTART'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { AnimatedSpriteMaterial, Suspense, useTexture } from '@threlte/extras';
import Fire from './Fire.svelte';
import Player from './Player.svelte';
import ThrelteLogo from './ThrelteLogo.svelte';
import { Tween } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const texture = useTexture('/textures/sprites/bg.png');
		let playerPosition = [-2.0, -2.75, 0.01];
		let playerAtFire = $.derived(() => Math.abs(playerPosition[0]) < 0.7);
		const fov = Tween.of(() => playerAtFire() ? 45 : 50, { easing: cubicOut, duration: 900 });
		const cameraPosY = Tween.of(() => playerAtFire() ? -0.9 : -0.2, { easing: cubicOut, duration: 900 });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Suspense($$renderer, {
				children: ($$renderer) => {
					Fire($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (T.AmbientLight) {
				$$renderer.push('<!--[-->');
				T.AmbientLight($$renderer, { color: '#6697C7', intensity: 0.3 });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Suspense($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like({ length: 9 });

					for (let index = 0, $$length = each_array.length; index < $$length; index++) {
						if (T.Sprite) {
							$$renderer.push('<!--[-->');

							T.Sprite($$renderer, {
								scale: 0.5,
								'position.y': -1.99,
								'position.x': index < 5
									? index / 2.4 + Math.random() * 0.4 - 2.8
									: index / 2.4 + Math.random() * 0.4 - 1,

								children: ($$renderer) => {
									AnimatedSpriteMaterial($$renderer, {
										textureUrl: '/textures/sprites/grass.png',
										totalFrames: 6,
										fps: 5,
										delay: index * 40
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			$.await($$renderer, texture, () => {}, (map) => {
				if (T.Sprite) {
					$$renderer.push('<!--[-->');

					T.Sprite($$renderer, {
						scale: 7.5,
						'position.z': -0.01,
						'position.y': 0.4,
						children: ($$renderer) => {
							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshBasicMaterial($$renderer, { map });
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
			});

			$$renderer.push(`<!--]--> `);

			Suspense($$renderer, {
				children: ($$renderer) => {
					ThrelteLogo($$renderer, { show: playerAtFire() });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Player($$renderer, {
				get position() {
					return playerPosition;
				},

				set position($$value) {
					playerPosition = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					'position.z': 7,
					'position.y': cameraPosY.current,
					fov: fov.current
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
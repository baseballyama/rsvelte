import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Edges, useGltf } from '@threlte/extras';
import { AutoColliders } from '@threlte/rapier';
import { MathUtils } from 'three';

import {
	arenaHeight,
	arenaWidth,
	playerHeight,
	playerSpeed,
	playerWidth
} from '../config';

import { useArcadeControls } from '../controls.svelte';
import { game } from '../Game.svelte';

export default function Player($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const controls = useArcadeControls();
		let positionZ = $.derived(() => arenaHeight / 2 - playerHeight);
		let positionX = 0;

		// 0.12 is a magic number that makes the player barely touch the border
		let posXMax = arenaWidth / 2 - playerWidth / 2 - 0.12;

		let playerCanMove = $.derived(() => game.state === 'playing' || game.state === 'await-ball-spawn' || game.state === 'level-loading');
		let centerPlayer = $.derived(() => game.state === 'menu' || game.state === 'level-loading');

		useTask((delta) => {
			if (!playerCanMove()) {
				if (centerPlayer()) {
					positionX = 0;
				}

				return;
			}

			// Analog-friendly: actions have strength 0–1 so a stick tilt scales speed.
			const direction = controls.axis('left', 'right');

			if (direction === 0) return;

			positionX = Math.min(Math.max(positionX + direction * playerSpeed * delta * 30, -posXMax), posXMax);
		});

		const gltf = useGltf('/models/ball-game/player/player-simple.glb');
		let colliders = [];

		useTask(() => {
			if (colliders.length) {
				const collider = colliders[0];

				collider.setTranslation({ x: positionX, y: 0, z: positionZ() });
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if ($.store_get($$store_subs ??= {}, '$gltf', gltf)?.nodes.Player) {
				$$renderer.push('<!--[0-->');

				if (T.Group) {
					$$renderer.push('<!--[-->');

					T.Group($$renderer, {
						children: ($$renderer) => {
							AutoColliders($$renderer, {
								shape: 'convexHull',
								get colliders() {
									return colliders;
								},

								set colliders($$value) {
									colliders = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											'position.z': positionZ(),
											'position.x': positionX,
											'rotation.x': MathUtils.DEG2RAD * -90,
											'rotation.y': MathUtils.DEG2RAD * 90,
											'scale.x': 0.5,
											'scale.y': 0.3,
											children: ($$renderer) => {
												T($$renderer, {
													is: $.store_get($$store_subs ??= {}, '$gltf', gltf).nodes.Player.geometry
												});

												$$renderer.push(`<!----> `);

												if (T.MeshStandardMaterial) {
													$$renderer.push('<!--[-->');
													T.MeshStandardMaterial($$renderer, { color: 'blue' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												Edges($$renderer, {
													scale: [1, 1.1, 1.1],
													thresholdAngle: 10,
													color: game.baseColor
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
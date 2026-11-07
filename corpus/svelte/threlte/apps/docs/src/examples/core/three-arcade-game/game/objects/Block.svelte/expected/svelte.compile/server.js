import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Edges } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';
import { cubicIn } from 'svelte/easing';
import { Tween } from 'svelte/motion';
import { clamp } from 'three/src/math/MathUtils.js';
import { game } from '../Game.svelte';

export default function Block($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			position,
			size,
			hit,
			freeze,
			staticColors,
			blinkingColors,
			onHit
		} = $$props;

		const scale = new Tween(0, { easing: cubicIn });

		scale.set(1);

		let innerColor = $.derived(() => blinkingColors
			? game.blinkClock === 0 ? blinkingColors.innerA : blinkingColors.innerB
			: staticColors.inner);

		let outerColor = $.derived(() => blinkingColors
			? game.blinkClock === 0 ? blinkingColors.outerA : blinkingColors.outerB
			: staticColors.outer);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'position.x': position.x,
				'position.z': position.z,
				children: ($$renderer) => {
					RigidBody($$renderer, {
						type: !hit || freeze ? 'fixed' : 'dynamic',
						canSleep: false,
						dominance: hit ? -1 : 1,
						enabledTranslations: [true, false, true],
						children: ($$renderer) => {
							Collider($$renderer, {
								shape: 'cuboid',
								args: [size / 2, 1 / 2, size / 2],
								oncontact: (e) => {
									if (e.totalForceMagnitude > 2000 || e.totalForceMagnitude < 300) return;

									const volume = clamp(Math.max(e.totalForceMagnitude, 0) / 2000, 0, 1);

									game.sound.playFromGroup('bounce', { volume });
								},

								oncollisionexit: () => {
									if (!hit) {
										onHit?.();
									}
								},
								mass: 1,
								children: ($$renderer) => {
									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											scale: scale.current,
											children: ($$renderer) => {
												if (T.BoxGeometry) {
													$$renderer.push('<!--[-->');
													T.BoxGeometry($$renderer, { args: [size, 1, size] });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (T.MeshStandardMaterial) {
													$$renderer.push('<!--[-->');
													T.MeshStandardMaterial($$renderer, { color: innerColor(), transparent: true, opacity: 0.6 });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);
												Edges($$renderer, { color: outerColor(), scale: 1.01 });
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
import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Attractor, Collider, RigidBody } from '@threlte/rapier';

import {
	FIELD_HEIGHT,
	FIELD_WIDTH,
	CHANNEL_X,
	ballRegistry,
	gameState
} from './gameState.svelte';

export default function Pockets($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const POCKET_SPECS = {
			low: { color: '#5a8ad0', value: 10 },
			mid: { color: '#65d99c', value: 25 },
			high: { color: '#ffaa55', value: 50 },
			jackpot: { color: '#ff3da6', value: 250 }
		};

		// A weak attractor hovers above the jackpot pocket — a touch of rigged pachinko physics.
		const JACKPOT_STRENGTH = 0.004;

		const JACKPOT_RANGE = 1.8;
		const JACKPOT_ORB_Y = 0.4;
		const playfieldLeft = -FIELD_WIDTH / 2 + 0.2;
		const playfieldRight = CHANNEL_X - 0.5;
		const pocketY = -FIELD_HEIGHT / 2 + 0.5;
		const playfieldSpan = playfieldRight - playfieldLeft;
		const layout = ['mid', 'high', 'low', 'jackpot', 'low', 'high', 'mid'];
		const slotWidth = playfieldSpan / layout.length;
		const pocketHalfW = slotWidth / 2 - 0.05;

		const pockets = layout.map((kind, i) => {
			const spec = POCKET_SPECS[kind];

			return {
				kind,
				x: playfieldLeft + slotWidth / 2 + i * slotWidth,
				...spec,
				onenter: ({ targetCollider }) => {
					const despawn = ballRegistry.get(targetCollider.handle);

					if (!despawn) return; // not a ball — ignore strays

					despawn();
					gameState.score += spec.value;
					gameState.lastPocketHit = kind;
				}
			};
		});

		const jackpot = pockets.find((p) => p.kind === 'jackpot');
		let orbPulse = 0;

		useTask((delta) => {
			orbPulse = (orbPulse + delta * 2.4) % (Math.PI * 2);
		});

		RigidBody($$renderer, {
			type: 'fixed',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(pockets);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let pocket = each_array[i];

					if (i > 0) {
						$$renderer.push('<!--[0-->');

						if (T.Group) {
							$$renderer.push('<!--[-->');

							T.Group($$renderer, {
								position: [pocket.x - slotWidth / 2, pocketY + 0.18, 0],
								children: ($$renderer) => {
									Collider($$renderer, { shape: 'cuboid', args: [0.05, 0.2, 0.18] });
									$$renderer.push(`<!----> `);

									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											castShadow: true,
											children: ($$renderer) => {
												if (T.BoxGeometry) {
													$$renderer.push('<!--[-->');
													T.BoxGeometry($$renderer, { args: [0.1, 0.4, 0.3] });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (T.MeshStandardMaterial) {
													$$renderer.push('<!--[-->');
													T.MeshStandardMaterial($$renderer, { color: '#3a2a55', metalness: 0.5, roughness: 0.3 });
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

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <!--[-->`);

		const each_array_1 = $.ensure_array_like(pockets);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let pocket = each_array_1[$$index_1];

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [pocket.x, pocketY, 0],
					children: ($$renderer) => {
						Collider($$renderer, {
							shape: 'cuboid',
							args: [pocketHalfW, 0.18, 0.2],
							sensor: true,
							onsensorenter: pocket.onenter
						});

						$$renderer.push(`<!----> `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								position: [0, -0.1, -0.1],
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [pocketHalfW * 2, 0.25, 0.05] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');

										T.MeshStandardMaterial($$renderer, {
											color: pocket.color,
											emissive: pocket.color,
											emissiveIntensity: 0.8,
											metalness: 0.3,
											roughness: 0.4
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--> `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position: [jackpot.x, pocketY + JACKPOT_ORB_Y, 0.1],
				children: ($$renderer) => {
					Attractor($$renderer, {
						strength: JACKPOT_STRENGTH,
						range: JACKPOT_RANGE,
						gravityType: 'linear'
					});

					$$renderer.push(`<!----> `);

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							scale: 1 + 0.12 * Math.sin(orbPulse),
							children: ($$renderer) => {
								if (T.IcosahedronGeometry) {
									$$renderer.push('<!--[-->');
									T.IcosahedronGeometry($$renderer, { args: [0.12, 0] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');

									T.MeshStandardMaterial($$renderer, {
										color: jackpot.color,
										emissive: jackpot.color,
										emissiveIntensity: 2 + 0.7 * Math.sin(orbPulse),
										metalness: 0.6,
										roughness: 0.2
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

					if (T.PointLight) {
						$$renderer.push('<!--[-->');

						T.PointLight($$renderer, {
							color: jackpot.color,
							intensity: 2 + Math.sin(orbPulse),
							distance: 1.4
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
	});
}
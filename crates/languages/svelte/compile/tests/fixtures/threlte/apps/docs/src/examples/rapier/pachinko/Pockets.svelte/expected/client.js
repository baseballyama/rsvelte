import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Attractor, Collider, RigidBody } from '@threlte/rapier';

import {
	FIELD_HEIGHT,
	FIELD_WIDTH,
	CHANNEL_X,
	ballRegistry,
	gameState
} from './gameState.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Pockets($$anchor, $$props) {
	$.push($$props, true);

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
	let orbPulse = $.state(0);

	useTask((delta) => {
		$.set(orbPulse, ($.get(orbPulse) + delta * 2.4) % (Math.PI * 2));
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	RigidBody(node, {
		type: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 18, () => pockets, (pocket) => pocket, ($$anchor, pocket, i) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => [pocket.x - slotWidth / 2, pocketY + 0.18, 0]);

							$.component(node_3, () => T.Group, ($$anchor, T_Group) => {
								T_Group($$anchor, {
									get position() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_4 = $.first_child(fragment_4);

										Collider(node_4, { shape: 'cuboid', args: [0.05, 0.2, 0.18] });

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
											T_Mesh($$anchor, {
												castShadow: true,
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_6 = $.first_child(fragment_5);

													$.component(node_6, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
														T_BoxGeometry($$anchor, { args: [0.1, 0.4, 0.3] });
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
														T_MeshStandardMaterial($$anchor, { color: '#3a2a55', metalness: 0.5, roughness: 0.3 });
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_3);
					};

					$.if(node_2, ($$render) => {
						if ($.get(i) > 0) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node, 2);

	$.each(node_8, 16, () => pockets, (pocket) => pocket, ($$anchor, pocket) => {
		var fragment_6 = $.comment();
		var node_9 = $.first_child(fragment_6);

		{
			let $0 = $.derived(() => [pocket.x, pocketY, 0]);

			$.component(node_9, () => T.Group, ($$anchor, T_Group_1) => {
				T_Group_1($$anchor, {
					get position() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root();
						var node_10 = $.first_child(fragment_7);

						{
							let $0 = $.derived(() => [pocketHalfW, 0.18, 0.2]);

							Collider(node_10, {
								shape: 'cuboid',
								get args() {
									return $.get($0);
								},
								sensor: true,
								get onsensorenter() {
									return pocket.onenter;
								}
							});
						}

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => T.Mesh, ($$anchor, T_Mesh_1) => {
							T_Mesh_1($$anchor, {
								position: [0, -0.1, -0.1],
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_12 = $.first_child(fragment_8);

									{
										let $0 = $.derived(() => [pocketHalfW * 2, 0.25, 0.05]);

										$.component(node_12, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
											T_BoxGeometry_1($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
										T_MeshStandardMaterial_1($$anchor, {
											get color() {
												return pocket.color;
											},

											get emissive() {
												return pocket.color;
											},
											emissiveIntensity: 0.8,
											metalness: 0.3,
											roughness: 0.4
										});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment_6);
	});

	var node_14 = $.sibling(node_8, 2);

	{
		let $0 = $.derived(() => [jackpot.x, pocketY + JACKPOT_ORB_Y, 0.1]);

		$.component(node_14, () => T.Group, ($$anchor, T_Group_2) => {
			T_Group_2($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_1();
					var node_15 = $.first_child(fragment_9);

					Attractor(node_15, {
						strength: JACKPOT_STRENGTH,
						range: JACKPOT_RANGE,
						gravityType: 'linear'
					});

					var node_16 = $.sibling(node_15, 2);

					{
						let $0 = $.derived(() => 1 + 0.12 * Math.sin($.get(orbPulse)));

						$.component(node_16, () => T.Mesh, ($$anchor, T_Mesh_2) => {
							T_Mesh_2($$anchor, {
								get scale() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root();
									var node_17 = $.first_child(fragment_10);

									$.component(node_17, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry) => {
										T_IcosahedronGeometry($$anchor, { args: [0.12, 0] });
									});

									var node_18 = $.sibling(node_17, 2);

									{
										let $0 = $.derived(() => 2 + 0.7 * Math.sin($.get(orbPulse)));

										$.component(node_18, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
											T_MeshStandardMaterial_2($$anchor, {
												get color() {
													return jackpot.color;
												},

												get emissive() {
													return jackpot.color;
												},

												get emissiveIntensity() {
													return $.get($0);
												},
												metalness: 0.6,
												roughness: 0.2
											});
										});
									}

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});
					}

					var node_19 = $.sibling(node_16, 2);

					{
						let $0 = $.derived(() => 2 + Math.sin($.get(orbPulse)));

						$.component(node_19, () => T.PointLight, ($$anchor, T_PointLight) => {
							T_PointLight($$anchor, {
								get color() {
									return jackpot.color;
								},

								get intensity() {
									return $.get($0);
								},
								distance: 1.4
							});
						});
					}

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
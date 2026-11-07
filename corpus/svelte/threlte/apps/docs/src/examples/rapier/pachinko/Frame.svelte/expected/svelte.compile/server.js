import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Collider, RigidBody } from '@threlte/rapier';
import { CHANNEL_BOTTOM_Y, CHANNEL_TOP_Y, FIELD_HEIGHT, FIELD_WIDTH } from './gameState.svelte';

export default function Frame($$renderer) {
	const wallThickness = 0.18;
	const channelWidth = 0.5;
	const halfW = FIELD_WIDTH / 2;
	const halfH = FIELD_HEIGHT / 2;

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			position: [0, 0, -0.18],
			receiveShadow: true,
			children: ($$renderer) => {
				if (T.BoxGeometry) {
					$$renderer.push('<!--[-->');
					T.BoxGeometry($$renderer, { args: [FIELD_WIDTH, FIELD_HEIGHT, 0.05] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshStandardMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshStandardMaterial($$renderer, { color: '#211a36', roughness: 0.85, metalness: 0.1 });
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

	RigidBody($$renderer, {
		type: 'fixed',
		children: ($$renderer) => {
			const channelWallLen = (CHANNEL_TOP_Y - CHANNEL_BOTTOM_Y) / 2;
			const channelWallCenterY = (CHANNEL_TOP_Y + CHANNEL_BOTTOM_Y) / 2;

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [-halfW, 0, 0],
					children: ($$renderer) => {
						Collider($$renderer, { shape: 'cuboid', args: [wallThickness / 2, halfH, 0.3] });
						$$renderer.push(`<!----> `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								castShadow: true,
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [wallThickness, FIELD_HEIGHT, 0.4] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { color: '#3a2a55', metalness: 0.4, roughness: 0.35 });
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

			$$renderer.push(` `);

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [halfW, 0, 0],
					children: ($$renderer) => {
						Collider($$renderer, { shape: 'cuboid', args: [wallThickness / 2, halfH, 0.3] });
						$$renderer.push(`<!----> `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								castShadow: true,
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [wallThickness, FIELD_HEIGHT, 0.4] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { color: '#3a2a55', metalness: 0.4, roughness: 0.35 });
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

			$$renderer.push(` `);

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [0, halfH, 0],
					children: ($$renderer) => {
						Collider($$renderer, { shape: 'cuboid', args: [halfW, wallThickness / 2, 0.3] });
						$$renderer.push(`<!----> `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								castShadow: true,
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [FIELD_WIDTH, wallThickness, 0.4] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { color: '#3a2a55', metalness: 0.4, roughness: 0.35 });
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

			$$renderer.push(` `);

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [0, -halfH, 0],
					children: ($$renderer) => {
						Collider($$renderer, { shape: 'cuboid', args: [halfW, wallThickness / 2, 0.3] });
						$$renderer.push(`<!----> `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								castShadow: true,
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [FIELD_WIDTH, wallThickness, 0.4] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { color: '#3a2a55', metalness: 0.4, roughness: 0.35 });
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

			$$renderer.push(`  `);

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [
						halfW - channelWidth - wallThickness / 2,
						channelWallCenterY,
						0
					],

					children: ($$renderer) => {
						Collider($$renderer, {
							shape: 'cuboid',
							args: [wallThickness / 2, channelWallLen, 0.3]
						});

						$$renderer.push(`<!----> `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								castShadow: true,
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [wallThickness, channelWallLen * 2, 0.4] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { color: '#5a3a8a', metalness: 0.5, roughness: 0.3 });
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

			$$renderer.push(` `);

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [halfW - 0.9, CHANNEL_TOP_Y + 1.5, 0],
					rotation: [0, 0, -Math.PI / 4],
					children: ($$renderer) => {
						Collider($$renderer, { shape: 'cuboid', args: [1.2, wallThickness / 2, 0.3] });
						$$renderer.push(`<!----> `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								castShadow: true,
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [2.4, wallThickness, 0.4] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { color: '#5a3a8a', metalness: 0.5, roughness: 0.3 });
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}
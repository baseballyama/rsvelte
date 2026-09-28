import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { Collider } from '@threlte/rapier';
import { arenaDepth, arenaHeight, arenaWidth } from '../config';
import { useArenaCollisionEnterEvent } from '../hooks/useArenaCollider';

export default function Arena($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const colliderWidth = 10;
		const sideGridOpacity = 0.7;
		const { onCollision: onTopCollision, opacity: topOpacity } = useArenaCollisionEnterEvent();
		const { onCollision: onLeftCollision, opacity: leftOpacity } = useArenaCollisionEnterEvent();
		const { onCollision: onRightCollision, opacity: rightOpacity } = useArenaCollisionEnterEvent();

		if (T.CustomGridHelper) {
			$$renderer.push('<!--[-->');

			T.CustomGridHelper($$renderer, {
				args: [arenaWidth, arenaWidth, arenaHeight, arenaWidth],
				'position.y': -0.5,
				children: ($$renderer) => {
					if (T.LineBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.LineBasicMaterial($$renderer, { color: 'green', transparent: true, opacity: 0.1 });
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

		if (T.CustomGridHelper) {
			$$renderer.push('<!--[-->');

			T.CustomGridHelper($$renderer, {
				args: [arenaDepth, arenaDepth, arenaHeight, arenaHeight],
				'rotation.z': 90 * MathUtils.DEG2RAD,
				'position.x': arenaWidth / 2 * -1,
				children: ($$renderer) => {
					if (T.LineBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.LineBasicMaterial($$renderer, { color: 'green', transparent: true, opacity: sideGridOpacity });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'rotation.x': 90 * MathUtils.DEG2RAD,
							children: ($$renderer) => {
								if (T.PlaneGeometry) {
									$$renderer.push('<!--[-->');
									T.PlaneGeometry($$renderer, { args: [arenaDepth, arenaHeight] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshBasicMaterial) {
									$$renderer.push('<!--[-->');

									T.MeshBasicMaterial($$renderer, {
										color: 'green',
										transparent: true,
										opacity: leftOpacity.current
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

		$$renderer.push(` `);

		if (T.CustomGridHelper) {
			$$renderer.push('<!--[-->');

			T.CustomGridHelper($$renderer, {
				args: [arenaDepth, arenaDepth, arenaHeight, arenaHeight],
				'rotation.z': 90 * MathUtils.DEG2RAD,
				'position.x': arenaWidth / 2,
				children: ($$renderer) => {
					if (T.LineBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.LineBasicMaterial($$renderer, { color: 'green', transparent: true, opacity: sideGridOpacity });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'rotation.x': -90 * MathUtils.DEG2RAD,
							children: ($$renderer) => {
								if (T.PlaneGeometry) {
									$$renderer.push('<!--[-->');
									T.PlaneGeometry($$renderer, { args: [arenaDepth, arenaHeight] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshBasicMaterial) {
									$$renderer.push('<!--[-->');

									T.MeshBasicMaterial($$renderer, {
										color: 'green',
										transparent: true,
										opacity: rightOpacity.current
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

		$$renderer.push(` `);

		if (T.CustomGridHelper) {
			$$renderer.push('<!--[-->');

			T.CustomGridHelper($$renderer, {
				args: [arenaDepth, arenaDepth, arenaHeight, arenaHeight],
				'rotation.y': 90 * MathUtils.DEG2RAD,
				'rotation.x': 90 * MathUtils.DEG2RAD,
				'position.z': arenaHeight / 2 * -1,
				children: ($$renderer) => {
					if (T.LineBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.LineBasicMaterial($$renderer, { color: 'green', transparent: true, opacity: sideGridOpacity });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'rotation.x': -90 * MathUtils.DEG2RAD,
							children: ($$renderer) => {
								if (T.PlaneGeometry) {
									$$renderer.push('<!--[-->');
									T.PlaneGeometry($$renderer, { args: [arenaDepth, arenaHeight] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshBasicMaterial) {
									$$renderer.push('<!--[-->');

									T.MeshBasicMaterial($$renderer, {
										color: 'green',
										transparent: true,
										opacity: topOpacity.current
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

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position: [(colliderWidth / 2 + arenaWidth / 2) * -1, 0, 0],
				children: ($$renderer) => {
					Collider($$renderer, {
						oncollisionenter: onLeftCollision,
						shape: 'cuboid',
						args: [colliderWidth / 2, 1 / 2, arenaHeight / 2]
					});
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
				position: [colliderWidth / 2 + arenaWidth / 2, 0, 0],
				children: ($$renderer) => {
					Collider($$renderer, {
						oncollisionenter: onRightCollision,
						shape: 'cuboid',
						args: [colliderWidth / 2, 1 / 2, arenaHeight / 2]
					});
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
				position: [0, 0, (colliderWidth / 2 + arenaHeight / 2) * -1],
				children: ($$renderer) => {
					Collider($$renderer, {
						oncollisionenter: onTopCollision,
						shape: 'cuboid',
						args: [
							(colliderWidth * 2 + arenaWidth) / 2,
							1 / 2,
							colliderWidth / 2
						]
					});
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
				position: [0, 0, colliderWidth / 2 + arenaHeight / 2],
				children: ($$renderer) => {
					Collider($$renderer, {
						sensor: true,
						shape: 'cuboid',
						args: [
							(colliderWidth * 2 + arenaWidth) / 2,
							1 / 2,
							colliderWidth / 2
						]
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
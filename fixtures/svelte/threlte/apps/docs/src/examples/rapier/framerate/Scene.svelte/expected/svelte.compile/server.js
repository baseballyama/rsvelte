import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { AutoColliders, RigidBody } from '@threlte/rapier';
import { DEG2RAD } from 'three/src/math/MathUtils.js';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { sleeping } = $$props;
		let sleepingObjects = 0;

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [3, 3, 3],
				oncreate: (ref) => ref.lookAt(0, 0, 0)
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
				position: [0, 0, -0.2],
				children: ($$renderer) => {
					RigidBody($$renderer, {
						type: 'dynamic',
						linearDamping: 1,
						angularDamping: 1,
						onsleep: () => sleepingObjects++,
						children: ($$renderer) => {
							AutoColliders($$renderer, {
								children: ($$renderer) => {
									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											castShadow: true,
											receiveShadow: true,
											children: ($$renderer) => {
												if (T.MeshStandardMaterial) {
													$$renderer.push('<!--[-->');
													T.MeshStandardMaterial($$renderer, { color: 'blue' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (T.BoxGeometry) {
													$$renderer.push('<!--[-->');
													T.BoxGeometry($$renderer, {});
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

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position: [0, 2, 0.3],
				'rotation.y': 20 * DEG2RAD,
				children: ($$renderer) => {
					RigidBody($$renderer, {
						type: 'dynamic',
						linearDamping: 1,
						angularDamping: 1,
						onsleep: () => sleepingObjects++,
						children: ($$renderer) => {
							AutoColliders($$renderer, {
								children: ($$renderer) => {
									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											castShadow: true,
											receiveShadow: true,
											children: ($$renderer) => {
												if (T.MeshStandardMaterial) {
													$$renderer.push('<!--[-->');
													T.MeshStandardMaterial($$renderer, { color: 'red' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (T.BoxGeometry) {
													$$renderer.push('<!--[-->');
													T.BoxGeometry($$renderer, {});
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

		$$renderer.push(` `);

		AutoColliders($$renderer, {
			shape: 'cuboid',
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						receiveShadow: true,
						'position.y': -1,
						children: ($$renderer) => {
							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshStandardMaterial($$renderer, { color: 'yellow' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.BoxGeometry) {
								$$renderer.push('<!--[-->');
								T.BoxGeometry($$renderer, { args: [4, 0.1, 4] });
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

		$$renderer.push(`<!----> `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');

			T.DirectionalLight($$renderer, {
				position: [4, 10, 0],
				castShadow: true,
				'shadow.mapSize': 1024,
				'shadow.camera.left': -10,
				'shadow.camera.right': 10,
				'shadow.camera.top': 10,
				'shadow.camera.bottom': -10
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}
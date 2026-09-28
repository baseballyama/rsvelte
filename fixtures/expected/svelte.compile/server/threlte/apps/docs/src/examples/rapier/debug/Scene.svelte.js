import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls, SoftShadows } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';

export default function Scene($$renderer, $$props) {
	let { materials } = $$props;
	const stack = Array.from({ length: 4 }, (_, i) => i);

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [10, 8, 10],
			fov: 45,
			children: ($$renderer) => {
				OrbitControls($$renderer, { enableDamping: true, enableZoom: false });
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);
	SoftShadows($$renderer, {});
	$$renderer.push(`<!----> `);

	if (T.DirectionalLight) {
		$$renderer.push('<!--[-->');
		T.DirectionalLight($$renderer, { castShadow: true, position: [3, 20, -3] });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.AmbientLight) {
		$$renderer.push('<!--[-->');
		T.AmbientLight($$renderer, { intensity: 0.4 });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <!--[-->`);

	const each_array = $.ensure_array_like(stack);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let i = each_array[$$index_1];

		$$renderer.push(`<!--[-->`);

		const each_array_1 = $.ensure_array_like(['capsule', 'cuboid', 'ball']);

		for (let j = 0, $$length = each_array_1.length; j < $$length; j++) {
			let shape = each_array_1[j];

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [i % 2 * 0.2 - 0.1, 1 + i * j * 1.05, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							children: ($$renderer) => {
								Collider($$renderer, { shape, args: [0.5, 0.5, 0.5], restitution: 0.2 });
								$$renderer.push(`<!----> `);

								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										castShadow: true,
										receiveShadow: true,
										children: ($$renderer) => {
											if (shape === 'cuboid') {
												$$renderer.push('<!--[0-->');

												if (T.BoxGeometry) {
													$$renderer.push('<!--[-->');
													T.BoxGeometry($$renderer, { args: [1, 1, 1] });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											} else if (shape === 'capsule') {
												$$renderer.push('<!--[1-->');

												if (T.CapsuleGeometry) {
													$$renderer.push('<!--[-->');
													T.CapsuleGeometry($$renderer, { args: [0.5, 1] });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											} else {
												$$renderer.push('<!--[-1-->');

												if (T.SphereGeometry) {
													$$renderer.push('<!--[-->');
													T.SphereGeometry($$renderer, { args: [0.5] });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(`<!--]--> `);

											if (T.MeshStandardMaterial) {
												$$renderer.push('<!--[-->');

												T.MeshStandardMaterial($$renderer, {
													color: 'orange',
													transparent: true,
													opacity: materials ? 1 : 0
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
	}

	$$renderer.push(`<!--]--> `);

	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, {
			position: [0, -0.5, 0],
			'rotation.x': Math.PI / 6,
			children: ($$renderer) => {
				RigidBody($$renderer, {
					type: 'fixed',
					children: ($$renderer) => {
						Collider($$renderer, { shape: 'cuboid', args: [5, 0.5, 5] });
						$$renderer.push(`<!----> `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								receiveShadow: true,
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [10, 1, 10] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { color: '#888' });
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

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, {
			position: [0, -8, 0],
			children: ($$renderer) => {
				Collider($$renderer, {
					args: [15, 1, 15],
					sensor: true,
					shape: 'cuboid',
					onsensorenter: (event) => {
						const body = event.targetRigidBody;

						body?.setLinvel({ x: 0, y: 0, z: 0 }, true);
						body?.setAngvel({ x: 0, y: 0, z: 0 }, true);
						body?.setTranslation({ x: 0, y: 15, z: 0 }, true);
					}
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
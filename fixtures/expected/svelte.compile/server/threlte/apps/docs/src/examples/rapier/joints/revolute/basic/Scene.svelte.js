import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls, SoftShadows } from '@threlte/extras';
import { Collider, Debug, RigidBody } from '@threlte/rapier';
import Pendulum from './Pendulum.svelte';

export default function Scene($$renderer, $$props) {
	let { debug, resetKey } = $$props;
	const stack = Array.from({ length: 4 }, (_, i) => i);

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [6, 4, 10],
			fov: 50,
			children: ($$renderer) => {
				OrbitControls($$renderer, { enableDamping: true, enableZoom: false, target: [0, 2.5, 0] });
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.DirectionalLight) {
		$$renderer.push('<!--[-->');

		T.DirectionalLight($$renderer, {
			castShadow: true,
			intensity: 2,
			position: [8, 20, -3],
			'shadow.camera.top': -20,
			'shadow.camera.bottom': 20,
			'shadow.mapSize.width': 1024,
			'shadow.mapSize.height': 1024
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.AmbientLight) {
		$$renderer.push('<!--[-->');
		T.AmbientLight($$renderer, { intensity: 1 });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);
	SoftShadows($$renderer, {});
	$$renderer.push(`<!----> `);

	if (debug) {
		$$renderer.push('<!--[0-->');
		Debug($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!---->`);

	{
		Pendulum($$renderer, {});
		$$renderer.push(`<!----> <!--[-->`);

		const each_array = $.ensure_array_like(stack);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let i = each_array[$$index];

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [-0.5, 0.5 + i, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							children: ($$renderer) => {
								Collider($$renderer, { shape: 'cuboid', args: [0.5, 0.5, 0.5] });
								$$renderer.push(`<!----> `);

								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										castShadow: true,
										children: ($$renderer) => {
											if (T.BoxGeometry) {
												$$renderer.push('<!--[-->');
												T.BoxGeometry($$renderer, { args: [1, 1, 1] });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (T.MeshStandardMaterial) {
												$$renderer.push('<!--[-->');
												T.MeshStandardMaterial($$renderer, { color: '#335086' });
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

	$$renderer.push(`<!----> `);

	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, {
			position: [0, -0.5, 0],
			children: ($$renderer) => {
				RigidBody($$renderer, {
					type: 'fixed',
					children: ($$renderer) => {
						Collider($$renderer, { shape: 'cuboid', args: [10, 0.5, 5] });
						$$renderer.push(`<!----> `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								receiveShadow: true,
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [20, 1, 10] });
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
}
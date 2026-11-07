import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { Collider, Debug, RigidBody } from '@threlte/rapier';
import Press from './Press.svelte';

export default function Scene($$renderer, $$props) {
	let { debug, resetKey } = $$props;

	const cubes = [
		[-1.1, 1.0, -0.6],
		[-0.5, 1.0, 0.5],
		[0.2, 1.0, -0.3],
		[0.8, 1.0, 0.4],
		[1.2, 1.0, -0.5]
	];

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [5, 4, 10],
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
		T.DirectionalLight($$renderer, { castShadow: true, position: [8, 20, -3] });
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

	$$renderer.push(` `);

	if (debug) {
		$$renderer.push('<!--[0-->');
		Debug($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!---->`);

	{
		Press($$renderer, {});
		$$renderer.push(`<!----> <!--[-->`);

		const each_array = $.ensure_array_like(cubes);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let pos = each_array[$$index];

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: pos,
					children: ($$renderer) => {
						RigidBody($$renderer, {
							children: ($$renderer) => {
								Collider($$renderer, {
									shape: 'cuboid',
									args: [0.15, 0.15, 0.15],
									density: 3,
									friction: 1.5
								});

								$$renderer.push(`<!----> `);

								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										castShadow: true,
										children: ($$renderer) => {
											if (T.BoxGeometry) {
												$$renderer.push('<!--[-->');
												T.BoxGeometry($$renderer, { args: [0.3, 0.3, 0.3] });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (T.MeshStandardMaterial) {
												$$renderer.push('<!--[-->');
												T.MeshStandardMaterial($$renderer, { color: '#FE3D00' });
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
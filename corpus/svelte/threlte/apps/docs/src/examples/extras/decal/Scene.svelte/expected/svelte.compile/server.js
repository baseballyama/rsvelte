import * as $ from 'svelte/internal/server';
import { DoubleSide, Vector3 } from 'three';
import { T } from '@threlte/core';

import {
	Decal,
	TransformControls,
	useTexture,
	OrbitControls,
	VirtualEnvironment,
	useSuspense
} from '@threlte/extras';

import { RigidBody as RigidBodyRef } from '@dimforge/rapier3d-compat';
import { Attractor, Collider, RigidBody } from '@threlte/rapier';

function lightformer($$renderer, color, shape, size, position) {
	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, {
			position,
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						oncreate: (ref) => ref.lookAt(0, 0, 0),
						children: ($$renderer) => {
							if (shape === 'circle') {
								$$renderer.push('<!--[0-->');

								if (T.CircleGeometry) {
									$$renderer.push('<!--[-->');
									T.CircleGeometry($$renderer, { args: [size / 2] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');

								if (T.PlaneGeometry) {
									$$renderer.push('<!--[-->');
									T.PlaneGeometry($$renderer, { args: [size, size] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(`<!--]--> `);

							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshBasicMaterial($$renderer, { color, side: DoubleSide });
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

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { controls = false, debug = false } = $$props;
		const suspend = useSuspense();
		const svelteIcon = suspend(useTexture('/icons/svelte.png'));
		const threlteIcon = suspend(useTexture('/icons/mstile-150x150.png'));
		let bodies = [];
		let position = [0.5, 0, 0.5];
		const vec3 = new Vector3();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					position: [5, 1, 4],
					children: ($$renderer) => {
						OrbitControls($$renderer, { enablePan: false, enableZoom: false, enableDamping: true });
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
				T.DirectionalLight($$renderer, { castShadow: true, position: [5, 5, 5], intensity: 1.25 });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);
			Attractor($$renderer, {});
			$$renderer.push(`<!----> `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					receiveShadow: true,
					children: ($$renderer) => {
						Collider($$renderer, { shape: 'ball', args: [1] });
						$$renderer.push(`<!----> `);

						if (T.SphereGeometry) {
							$$renderer.push('<!--[-->');
							T.SphereGeometry($$renderer, { args: [1, 256, 128] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshStandardMaterial($$renderer, { roughness: 0.1 });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if ($.store_get($$store_subs ??= {}, '$svelteIcon', svelteIcon)) {
							$$renderer.push('<!--[0-->');

							{
								function children($$renderer) {
									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');

										T.MeshStandardMaterial($$renderer, {
											map: $.store_get($$store_subs ??= {}, '$svelteIcon', svelteIcon),
											transparent: true,
											roughness: 0.2,
											polygonOffset: true,
											polygonOffsetFactor: -10
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (controls) {
										$$renderer.push('<!--[0-->');

										TransformControls($$renderer, {
											oncreate: (ref) => {
												ref.position.fromArray(position);
											},

											onchange: (event) => {
												if (event.target.object) event.target.object.position.toArray(position);
											}
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								Decal($$renderer, { position, debug, children, $$slots: { default: true } });
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <!--[-->`);

			const each_array = $.ensure_array_like({ length: 20 });

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				RigidBody($$renderer, {
					oncreate: (ref) => {
						vec3.randomDirection();
						ref.setTranslation(vec3, true);
					},

					get rigidBody() {
						return bodies[index];
					},

					set rigidBody($$value) {
						bodies[index] = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								castShadow: true,
								children: ($$renderer) => {
									Collider($$renderer, { shape: 'ball', args: [0.3], restitution: 0.2 });
									$$renderer.push(`<!----> `);

									if (T.SphereGeometry) {
										$$renderer.push('<!--[-->');
										T.SphereGeometry($$renderer, { args: [0.3, 256, 128] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { roughness: 0.2 });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									Decal($$renderer, {
										position: [0.35, 0.35, 0.35],
										rotation: Math.PI / 4,
										scale: 1,
										depthTest: true,
										debug,
										children: ($$renderer) => {
											if (T.MeshStandardMaterial) {
												$$renderer.push('<!--[-->');

												T.MeshStandardMaterial($$renderer, {
													map: $.store_get($$store_subs ??= {}, '$threlteIcon', threlteIcon),
													transparent: true,
													roughness: 0.2,
													polygonOffset: true,
													polygonOffsetFactor: -10
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
			}

			$$renderer.push(`<!--]--> `);

			VirtualEnvironment($$renderer, {
				frames: 10,
				children: ($$renderer) => {
					lightformer($$renderer, '#FF4F4F', 'plane', 20, [0, 0, -20]);
					$$renderer.push(`<!----> `);
					lightformer($$renderer, '#FFD0CB', 'circle', 5, [0, 5, 0]);
					$$renderer.push(`<!----> `);
					lightformer($$renderer, '#2223FF', 'plane', 8, [-3, 0, 4]);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
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
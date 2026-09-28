import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls, Environment, useGltf } from '@threlte/extras';
import { AutoColliders, RigidBody } from '@threlte/rapier';
import { derived } from 'svelte/store';
import { MathUtils } from 'three';
import Ground from './Ground.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const gltf = useGltf('/models/helmet/DamagedHelmet.gltf');

		const helmet = derived(gltf, (gltf) => {
			if (!gltf || !gltf.nodes['node_damagedHelmet_-6514']) return;

			return gltf.nodes['node_damagedHelmet_-6514'];
		});

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
		});

		$$renderer.push(`<!----> `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				'position.x': 12,
				'position.y': 13,
				fov: 40,
				children: ($$renderer) => {
					OrbitControls($$renderer, {});
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

		if ($.store_get($$store_subs ??= {}, '$helmet', helmet)) {
			$$renderer.push('<!--[0-->');

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [-2.5, 2, 2.5],
					rotation: [90 * MathUtils.DEG2RAD, 0, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							children: ($$renderer) => {
								AutoColliders($$renderer, {
									shape: 'convexHull',
									children: ($$renderer) => {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												geometry: $.store_get($$store_subs ??= {}, '$helmet', helmet).geometry,
												material: $.store_get($$store_subs ??= {}, '$helmet', helmet).material
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
					position: [2.5, 2, 2.5],
					rotation: [90 * MathUtils.DEG2RAD, 0, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							children: ($$renderer) => {
								AutoColliders($$renderer, {
									shape: 'ball',
									children: ($$renderer) => {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												geometry: $.store_get($$store_subs ??= {}, '$helmet', helmet).geometry,
												material: $.store_get($$store_subs ??= {}, '$helmet', helmet).material
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
					position: [2.5, 2, -2.5],
					rotation: [90 * MathUtils.DEG2RAD, 0, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							children: ($$renderer) => {
								AutoColliders($$renderer, {
									shape: 'cuboid',
									children: ($$renderer) => {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												geometry: $.store_get($$store_subs ??= {}, '$helmet', helmet).geometry,
												material: $.store_get($$store_subs ??= {}, '$helmet', helmet).material
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
					position: [0, 2, 0],
					rotation: [90 * MathUtils.DEG2RAD, 0, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							children: ($$renderer) => {
								AutoColliders($$renderer, {
									shape: 'trimesh',
									children: ($$renderer) => {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												geometry: $.store_get($$store_subs ??= {}, '$helmet', helmet).geometry,
												material: $.store_get($$store_subs ??= {}, '$helmet', helmet).material
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
					position: [-2.5, 2, -2.5],
					rotation: [90 * MathUtils.DEG2RAD, 0, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							children: ($$renderer) => {
								AutoColliders($$renderer, {
									shape: 'capsule',
									children: ($$renderer) => {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												geometry: $.store_get($$store_subs ??= {}, '$helmet', helmet).geometry,
												material: $.store_get($$store_subs ??= {}, '$helmet', helmet).material
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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (T.GridHelper) {
			$$renderer.push('<!--[-->');
			T.GridHelper($$renderer, { args: [50] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		Ground($$renderer, {});
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
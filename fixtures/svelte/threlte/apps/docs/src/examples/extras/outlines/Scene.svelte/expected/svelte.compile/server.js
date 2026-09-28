import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Edges, Outlines, useDraco, useGltf } from '@threlte/extras';
import { Mesh, MeshStandardMaterial, MathUtils } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let rotation = 0;

		useTask((delta) => {
			rotation += delta;
		});

		const helmetGltf = useGltf('/models/helmet/DamagedHelmet.gltf');
		const helmetGeometry = $.derived(() => $.store_get($$store_subs ??= {}, '$helmetGltf', helmetGltf)?.nodes['node_damagedHelmet_-6514'].geometry);
		const dracoLoader = useDraco();
		const suziGltf = useGltf('/models/Suzanne.glb', { dracoLoader });

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');
			T.PerspectiveCamera($$renderer, { makeDefault: true, 'position.z': 20, fov: 20 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { position: [5, 5, 5] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'rotation.y': rotation,
				'position.x': -3,
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							children: ($$renderer) => {
								if (T.TorusKnotGeometry) {
									$$renderer.push('<!--[-->');
									T.TorusKnotGeometry($$renderer, { args: [0.5, 0.15, 128, 64] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshToonMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshToonMaterial($$renderer, { color: '#ff3e00' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);
								Outlines($$renderer, { color: 'white' });
								$$renderer.push(`<!----> `);
								Outlines($$renderer, { color: 'hotpink', thickness: 0.05 });
								$$renderer.push(`<!----> `);
								Outlines($$renderer, { color: 'yellow', thickness: 0.1 });
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

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'rotation.y': rotation,
				children: ($$renderer) => {
					if (helmetGeometry()) {
						$$renderer.push('<!--[0-->');

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								'rotation.x': 90 * MathUtils.DEG2RAD,
								geometry: helmetGeometry(),
								children: ($$renderer) => {
									if (T.MeshBasicMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshBasicMaterial($$renderer, { color: '#ff3e00', toneMapped: false });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);
									Edges($$renderer, { thresholdAngle: 20, color: 'white', scale: 1.01 });
									$$renderer.push(`<!----> `);
									Outlines($$renderer, { color: 'white', thickness: 0.04 });
									$$renderer.push(`<!---->`);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if ($.store_get($$store_subs ??= {}, '$suziGltf', suziGltf)) {
			$$renderer.push('<!--[0-->');

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					'rotation.y': rotation,
					'position.x': 3,
					children: ($$renderer) => {
						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								geometry: $.store_get($$store_subs ??= {}, '$suziGltf', suziGltf).nodes['Suzanne'].geometry,
								children: ($$renderer) => {
									if (T.MeshToonMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshToonMaterial($$renderer, { color: 'turquoise' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);
									Outlines($$renderer, { color: 'white', screenspace: true, thickness: 3 });
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
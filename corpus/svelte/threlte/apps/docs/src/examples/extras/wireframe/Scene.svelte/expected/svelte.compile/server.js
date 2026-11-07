import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import Character from './Character.svelte';
import { InstancedMesh, Instance, Wireframe, Outlines, Float } from '@threlte/extras';
import { Vector3, Quaternion } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { wireframeProps } = $$props;
		let boxes = void 0;
		const numCubes = 70;

		useTask((delta) => {
			if (boxes) boxes.rotation.y += delta / 60;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					position: [-0.8, 1.2, 1.7],
					oncreate: (ref) => {
						ref.lookAt(0, 1, 0);
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

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
				T.DirectionalLight($$renderer, { position: [10, 5, 5], castShadow: true });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);
			Character($$renderer, { wireframeProps });
			$$renderer.push(`<!----> `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					'rotation.x': -90 * (Math.PI / 180),
					receiveShadow: true,
					children: ($$renderer) => {
						if (T.CircleGeometry) {
							$$renderer.push('<!--[-->');
							T.CircleGeometry($$renderer, { args: [3, 72] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshStandardMaterial($$renderer, { color: 'white' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);
						Outlines($$renderer, { color: 'red', thickness: 10 });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			InstancedMesh($$renderer, {
				castShadow: true,
				get ref() {
					return boxes;
				},

				set ref($$value) {
					boxes = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [0.07, 0.07, 0.07] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Wireframe($$renderer, $.spread_props([wireframeProps]));
					$$renderer.push(`<!----> <!--[-->`);

					const each_array = $.ensure_array_like({ length: numCubes });

					for (let index = 0, $$length = each_array.length; index < $$length; index++) {
						const height = new Vector3(0, 1.2, 0);
						const position = new Vector3().randomDirection().add(height).toArray();
						const quaternion = new Quaternion().random().toArray();
						const scale = new Vector3().randomDirection().multiplyScalar(2).toArray();

						Float($$renderer, {
							seed: Math.random() * index,
							children: ($$renderer) => {
								Instance($$renderer, { position, quaternion, scale });
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
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
	});
}
import * as $ from 'svelte/internal/server';
import CounterLabel from './CounterLabel.svelte';
import CssObject from './CssObject.svelte';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from '@threlte/extras';
import { T, useTask, useThrelte } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { element } = $$props;
		const { autoRenderTask, camera, scene, size } = useThrelte();

		// note that the renderer won't be reactive if `element` updates
		// you'd have to do `$derived(new CSS2DRenderer({element}))` if you'd want that to be the case
		const cssRenderer = new CSS2DRenderer({ element });

		// We are running two renderers, and don't want to run
		// updateMatrixWorld twice; tell the renderers that we'll handle
		// it manually.
		// https://threejs.org/docs/#api/en/core/Object3D.updateWorldMatrix
		const last = scene.matrixWorldAutoUpdate;

		scene.matrixWorldAutoUpdate = false;

		// To update the matrices *once* per frame, we'll use a task that is added
		// right before the autoRenderTask. This way, we can be sure that the
		// matrices are updated before the renderers run.
		useTask(
			() => {
				scene.updateMatrixWorld();
			},
			{ before: autoRenderTask }
		);

		// The CSS2DRenderer needs to be updated after the autoRenderTask, so we
		// add a task that runs after it.
		useTask(
			() => {
				// Update the DOM
				cssRenderer.render(scene, camera.current);
			},
			{ after: autoRenderTask, autoInvalidate: false }
		);

		const params = [
			{ color: '#4F6FF6', label: 'Hello', position: [-1, 2, 1] },
			{ color: '#6FF64F', label: 'CSS', position: [1, 2, 1] },
			{ color: '#F64F6F', label: 'Renderer', position: [1, 2, -1] }
		];

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [5, 5, 5],
				children: ($$renderer) => {
					OrbitControls($$renderer, { enableDamping: true });
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
			T.DirectionalLight($$renderer, { position: [0, 10, 10] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'position.y': 1,
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [2, 2, 2] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#F64F6F' });
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

		$$renderer.push(` <!--[-->`);

		const each_array = $.ensure_array_like(params);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { color, label, position } = each_array[$$index];

			{
				function content($$renderer) {
					CounterLabel($$renderer, { label });
				}

				CssObject($$renderer, {
					position,
					center: [0, 0.5],
					content,
					children: ($$renderer) => {
						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								children: ($$renderer) => {
									if (T.SphereGeometry) {
										$$renderer.push('<!--[-->');
										T.SphereGeometry($$renderer, { args: [0.25] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { color });
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
					$$slots: { content: true, default: true }
				});
			}
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
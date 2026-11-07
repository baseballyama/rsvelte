import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Instance, InstancedMesh, RoundedBoxGeometry } from '@threlte/extras';
import { BaseConfig } from './config.svelte.js';
import { StaticState } from '@threlte/studio';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class SceneConfig extends StaticState {
			/**
			 * @min 0
			 * @max 5
			 * @step 1
			 */
			grid = { x: 5, y: 5 };

			color = '#fe3d00';
			camera = { x: 0, y: 4, z: 22 };
		}

		const baseConfig = new BaseConfig();
		const sceneConfig = new SceneConfig();

		const countFloor = $.derived(() => ({
			x: Math.max(Math.floor(sceneConfig.grid.x), 1),
			y: Math.max(Math.floor(sceneConfig.grid.y), 1)
		}));

		const center = $.derived(() => ({ x: countFloor().x * -1 + 1, y: countFloor().y * -1 + 1 }));

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				position: [0, 2, 22],
				makeDefault: true,
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

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { position: [3, 10, 7], intensity: Math.PI });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position: [center().x, center().y, 0],
				children: ($$renderer) => {
					InstancedMesh($$renderer, {
						children: ($$renderer) => {
							RoundedBoxGeometry($$renderer, { radius: 0.2, args: [1.5, 1.5, 1.5] });
							$$renderer.push(`<!----> `);

							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');

								T.MeshStandardMaterial($$renderer, {
									color: sceneConfig.color,
									transparent: true,
									opacity: baseConfig.opacity,
									alphaToCoverage: true
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <!--[-->`);

							const each_array = $.ensure_array_like({ length: countFloor().x });

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let _ = each_array[i];

								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like({ length: countFloor().y });

								for (let j = 0, $$length = each_array_1.length; j < $$length; j++) {
									let _ = each_array_1[j];

									Instance($$renderer, { position: [i * 2, j * 2, 0] });
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]-->`);
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
	});
}
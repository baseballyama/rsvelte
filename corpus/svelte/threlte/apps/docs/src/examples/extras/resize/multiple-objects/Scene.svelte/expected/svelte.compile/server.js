import * as $ from 'svelte/internal/server';
import { OrbitControls, Resize, useGltf } from '@threlte/extras';
import { T } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { resize = true } = $$props;
		const names = ['Duck', 'Flower', 'Fox'];
		const promises = Promise.all(names.map((name) => useGltf(`/models/${name}.glb`)));
		const increment = 2 * Math.PI / names.length;

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [5, 5, 5],
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

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.2 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { position: [1, 5, 3] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		$.await($$renderer, promises, () => {}, (objects) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(objects);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let { scene } = each_array[i];
				const r = increment * i;

				if (T.Group) {
					$$renderer.push('<!--[-->');

					T.Group($$renderer, {
						'position.x': Math.cos(r),
						'position.z': Math.sin(r),
						children: ($$renderer) => {
							if (resize) {
								$$renderer.push('<!--[0-->');

								Resize($$renderer, {
									children: ($$renderer) => {
										T($$renderer, { is: scene });
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
								T($$renderer, { is: scene });
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
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<!--]-->`);
	});
}
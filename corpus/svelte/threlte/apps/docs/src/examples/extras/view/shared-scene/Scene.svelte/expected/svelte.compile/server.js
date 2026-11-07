import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { OrbitControls, View } from '@threlte/extras';
import { Color } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { minimap } = $$props;
		const { scene } = useThrelte();

		scene.background = new Color('white');

		if (T.HemisphereLight) {
			$$renderer.push('<!--[-->');
			T.HemisphereLight($$renderer, { args: [0xaaaaaa, 0x444444, 3] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { args: [0xffffff, 1.5], position: [2, 4, 2] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <!--[-->`);

		const each_array = $.ensure_array_like([0xff7eb6, 0x82cfff, 0xa7f0ba]);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let color = each_array[index];

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					'position.x': (index - 1) * 1.2,
					children: ($$renderer) => {
						if (T.BoxGeometry) {
							$$renderer.push('<!--[-->');
							T.BoxGeometry($$renderer, { args: [0.6, 0.6, 0.6] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshStandardMaterial($$renderer, { color, flatShading: true });
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

		$$renderer.push(`<!--]--> `);

		View($$renderer, {
			dom: minimap,
			scene,
			children: ($$renderer) => {
				OrbitControls($$renderer, { autoRotate: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}
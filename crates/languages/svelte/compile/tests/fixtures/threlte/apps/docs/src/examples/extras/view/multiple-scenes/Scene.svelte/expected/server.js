import * as $ from 'svelte/internal/server';
import { T, useTask, useThrelte } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { Color } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { geometry, material } = $$props;
		const { scene } = useThrelte();
		let rotation = 0;

		scene.background = new Color(0xe0e0e0);

		useTask((delta) => {
			rotation += delta;
		});

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [0, 0, 2],
				fov: 50,
				near: 1,
				far: 10,
				children: ($$renderer) => {
					OrbitControls($$renderer, { minDistance: 2, maxDistance: 5, enablePan: false });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

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
			T.DirectionalLight($$renderer, { args: [0xffffff, 1.5], position: [1, 1, 1] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'rotation.y': rotation,
				children: ($$renderer) => {
					T($$renderer, { is: geometry });
					$$renderer.push(`<!----> `);
					T($$renderer, { is: material });
					$$renderer.push(`<!---->`);
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
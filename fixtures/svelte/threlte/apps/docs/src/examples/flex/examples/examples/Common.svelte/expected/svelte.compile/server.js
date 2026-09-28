import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';

export default function Common($$renderer) {
	if (T.OrthographicCamera) {
		$$renderer.push('<!--[-->');

		T.OrthographicCamera($$renderer, {
			makeDefault: true,
			near: 44,
			far: 4400,
			position: [0, 0, 3000],
			oncreate: (ref) => ref.lookAt(0, 0, 0),
			children: ($$renderer) => {
				OrbitControls($$renderer, { zoomToCursor: true });
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
		T.DirectionalLight($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}
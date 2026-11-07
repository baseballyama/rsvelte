import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Environment, GLTF, OrbitControls } from '@threlte/extras';

export default function Scene($$renderer) {
	Environment($$renderer, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	$$renderer.push(`<!----> `);

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [5, 2, 5],
			fov: 25,
			children: ($$renderer) => {
				OrbitControls($$renderer, { autoRotate: true, enableDamping: true, enableZoom: false });
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
		T.AmbientLight($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);
	GLTF($$renderer, { url: '/models/helmet/DamagedHelmet.gltf' });
	$$renderer.push(`<!---->`);
}
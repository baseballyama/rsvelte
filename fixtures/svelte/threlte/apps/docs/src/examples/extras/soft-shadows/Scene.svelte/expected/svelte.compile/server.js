import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Environment, OrbitControls, SoftShadows } from '@threlte/extras';
import Suzanne from './Suzanne.svelte';

export default function Scene($$renderer, $$props) {
	let { enabled, size, focus, samples } = $$props;

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [0, 8, 15],
			fov: 36,
			children: ($$renderer) => {
				OrbitControls($$renderer, { enableZoom: false, enableDamping: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);
	Suzanne($$renderer, {});
	$$renderer.push(`<!----> `);

	if (T.DirectionalLight) {
		$$renderer.push('<!--[-->');

		T.DirectionalLight($$renderer, {
			position: [5, 8, 4],
			castShadow: true,
			'shadow.mapSize.width': 1024,
			'shadow.mapSize.height': 1024,
			'shadow.bias': 0.0001
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (enabled) {
		$$renderer.push('<!--[0-->');
		SoftShadows($$renderer, { size, focus, samples });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	Environment($$renderer, {
		url: '/textures/equirectangular/hdr/mpumalanga_veld_puresky_1k.hdr'
	});

	$$renderer.push(`<!---->`);
}
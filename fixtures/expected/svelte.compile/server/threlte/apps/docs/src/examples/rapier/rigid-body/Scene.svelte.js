import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls, AudioListener } from '@threlte/extras';
import { Debug } from '@threlte/rapier';
import Emitter from './Emitter.svelte';
import Ground from './Ground.svelte';

export default function Scene($$renderer) {
	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [10, 10, 10],
			children: ($$renderer) => {
				OrbitControls($$renderer, { enableZoom: false });
				$$renderer.push(`<!----> `);
				AudioListener($$renderer, {});
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

	if (T.DirectionalLight) {
		$$renderer.push('<!--[-->');
		T.DirectionalLight($$renderer, { castShadow: true, position: [8, 20, -3] });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.GridHelper) {
		$$renderer.push('<!--[-->');
		T.GridHelper($$renderer, { args: [50] });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);
	Ground($$renderer, {});
	$$renderer.push(`<!----> `);
	Debug($$renderer, {});
	$$renderer.push(`<!----> `);
	Emitter($$renderer, {});
	$$renderer.push(`<!---->`);
}
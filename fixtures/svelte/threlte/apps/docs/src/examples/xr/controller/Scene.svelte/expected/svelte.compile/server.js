import * as $ from 'svelte/internal/server';
import { Fog, Color } from 'three';
import { T, useThrelte } from '@threlte/core';
import { XR } from '@threlte/xr';
import Controller from './Controller.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { scene } = useThrelte();

		scene.fog = new Fog('black', 1.5, 2);
		scene.background = new Color('black');

		XR($$renderer, {
			children: ($$renderer) => {
				Controller($$renderer, { left: true });
				$$renderer.push(`<!----> `);
				Controller($$renderer, { right: true });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 1.5 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { intensity: 1.5 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}
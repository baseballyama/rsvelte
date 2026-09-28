import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { useStaticState } from '@threlte/studio/extensions';
import Box from './Box.svelte';
import { SceneConfig } from './config.svelte';
import Icosahedron from './Icosahedron.svelte';
import Sphere from './Sphere.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const staticStateExtension = useStaticState();

		staticStateExtension.enableEditor();

		const config = new SceneConfig();

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				fov: 33.75,
				position: [0, 2, 10],
				oncreate: (ref) => {
					ref.lookAt(0, 0, 0);
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

			T.DirectionalLight($$renderer, {
				position: [3, 10, 7],
				intensity: config.directionalLightIntensity
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: config.ambientLightIntensity });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		Icosahedron($$renderer, { position: [-2, 0, 0] });
		$$renderer.push(`<!----> `);

		if (config.showBox) {
			$$renderer.push('<!--[0-->');
			Box($$renderer, { position: [0, 0, 0] });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		Sphere($$renderer, { position: [2, 0, 0] });
		$$renderer.push(`<!---->`);
	});
}
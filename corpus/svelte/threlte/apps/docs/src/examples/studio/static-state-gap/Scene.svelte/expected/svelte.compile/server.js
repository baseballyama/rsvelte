import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { StaticState } from '@threlte/studio';
import { useStaticState } from '@threlte/studio/extensions';
import Box from './Box.svelte';
import Icosahedron from './Icosahedron.svelte';
import Sphere from './Sphere.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const staticStateExtension = useStaticState();

		staticStateExtension.enableEditor();

		class SceneConfig extends StaticState {
			/**
			 * @min 1.5
			 * @max 5
			 */
			gap = 2;
		}

		const sceneConfig = new SceneConfig();

		Icosahedron($$renderer, { position: [-sceneConfig.gap, 0, 0] });
		$$renderer.push(`<!----> `);
		Box($$renderer, { position: [0, 0, 0] });
		$$renderer.push(`<!----> `);
		Sphere($$renderer, { position: [sceneConfig.gap, 0, 0] });
		$$renderer.push(`<!----> `);

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
			T.DirectionalLight($$renderer, { position: [3, 10, 7], intensity: 2.7 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.13 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}
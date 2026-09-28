import * as $ from 'svelte/internal/server';
import { Canvas, T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	let minimap = void 0;

	$$renderer.push(`<div id="container" class="svelte-1ms9lf2">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					position: [1.6, 1.6, 3.6],
					fov: 50,
					oncreate: (ref) => ref.lookAt(0, 0, 0)
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);
			Scene($$renderer, { minimap });
			$$renderer.push(`<!----> `);
			OrbitControls($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div id="minimap" class="svelte-1ms9lf2"></div></div>`);
}
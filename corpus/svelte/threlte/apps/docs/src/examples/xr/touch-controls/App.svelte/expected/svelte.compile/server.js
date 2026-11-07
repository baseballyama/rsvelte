import * as $ from 'svelte/internal/server';
import { T, Canvas } from '@threlte/core';
import { XR, VRButton } from '@threlte/xr';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-xj7z8v">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
			$$renderer.push(`<!----> `);

			{
				function fallback($$renderer) {
					if (T.PerspectiveCamera) {
						$$renderer.push('<!--[-->');

						T.PerspectiveCamera($$renderer, {
							makeDefault: true,
							position: [0, 1.5, 0.5],
							oncreate: (ref) => {
								ref.lookAt(0, 1.3, 0);
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				XR($$renderer, { fallback, $$slots: { fallback: true } });
			}

			$$renderer.push(`<!----> `);

			if (T.AmbientLight) {
				$$renderer.push('<!--[-->');
				T.AmbientLight($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.DirectionalLight) {
				$$renderer.push('<!--[-->');
				T.DirectionalLight($$renderer, { intensity: 1.5, position: [1, 1, 1] });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	VRButton($$renderer, {});
	$$renderer.push(`<!----></div>`);
}
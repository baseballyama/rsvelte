import * as $ from 'svelte/internal/server';
import { T, Canvas } from '@threlte/core';
import { XR, VRButton } from '$lib/index.js';
import Scene from './Scene.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="svelte-1c26fm">`);

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
							position: [0, 1.5, 4],
							oncreate: (ref) => {
								ref.lookAt(0, 1.5, 0);
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
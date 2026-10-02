import * as $ from 'svelte/internal/server';
import { Canvas, T } from '@threlte/core';
import Scene from './Scene.svelte';
import { NoToneMapping } from 'three';
import { OrbitControls } from '@threlte/extras';

export default function App($$renderer) {
	let innerWidth = 0;

	$$renderer.push(`<div class="relative h-screen w-screen">`);

	Canvas($$renderer, {
		toneMapping: NoToneMapping,
		children: ($$renderer) => {
			if (T.OrthographicCamera) {
				$$renderer.push('<!--[-->');

				T.OrthographicCamera($$renderer, {
					makeDefault: true,
					'position.z': 1000,
					zoom: innerWidth / 500,
					children: ($$renderer) => {
						OrbitControls($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);
			Scene($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}
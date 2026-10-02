import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-12itv1x">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <ul class="svelte-12itv1x"><li>Press <b>S</b> to toggle scope mode.</li> <li><b>Mousewheel</b> or <b>A/D</b> to adjust zoom level.</li></ul></div>`);
}
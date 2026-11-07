import * as $ from 'svelte/internal/server';
import { Canvas } from '$lib';
import Background from './Background.svelte';
import Logo from './Logo.svelte';

export default function App($$renderer) {
	Canvas($$renderer, {
		autoplay: true,
		children: ($$renderer) => {
			Logo($$renderer, {});
			$$renderer.push(`<!----> `);
			Background($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}
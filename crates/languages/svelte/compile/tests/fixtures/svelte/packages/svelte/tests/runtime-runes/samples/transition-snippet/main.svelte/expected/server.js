import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { linear } from 'svelte/easing';
import Container from './Container.svelte';

export default function Main($$renderer) {
	Container($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<p style="opacity: 1">hello</p>`);
		},
		$$slots: { default: true }
	});
}
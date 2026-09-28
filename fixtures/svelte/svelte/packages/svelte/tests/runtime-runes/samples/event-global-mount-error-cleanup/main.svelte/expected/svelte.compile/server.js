import * as $ from 'svelte/internal/server';
import { mount, onMount } from 'svelte';
import Outer from './Outer.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let el;

		onMount(() => {
			try {
				mount(Outer, { target: el });
			} catch {}
		});

		$$renderer.push(`<div></div>`);
	});
}
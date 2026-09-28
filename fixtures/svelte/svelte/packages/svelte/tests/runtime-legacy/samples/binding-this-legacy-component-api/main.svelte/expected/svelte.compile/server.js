import * as $ from 'svelte/internal/server';
import Sub from './sub.svelte';
import { onMount } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let component;

		onMount(() => {
			component.$on('increment', (e) => {
				count += e.detail;
				component.$set({ count });
			});
		});

		Sub($$renderer, {});
	});
}
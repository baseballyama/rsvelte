import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import Inner from './inner.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let target;

		onMount(() => {
			new Inner({ target, props: { num: 1 } });
		});

		$$renderer.push(`<div></div>`);
	});
}
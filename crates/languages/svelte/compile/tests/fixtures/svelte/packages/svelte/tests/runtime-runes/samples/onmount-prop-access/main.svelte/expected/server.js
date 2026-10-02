import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import Component from './Component.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let key = 0;

		onMount(() => {
			key = 1;
		});

		$$renderer.push(`<!---->`);

		{
			Component($$renderer, {});
		}

		$$renderer.push(`<!---->`);
	});
}
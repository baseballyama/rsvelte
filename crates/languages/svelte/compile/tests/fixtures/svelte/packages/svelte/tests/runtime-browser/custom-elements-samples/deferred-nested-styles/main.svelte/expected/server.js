import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = [];

		// Add the item _after_ the initial mount, so that the each block renders the
		// new item into an offscreen anchor that is discarded once it's committed to
		// the DOM. This reproduces styles being injected into `document.head` instead
		// of the shadow root (https://github.com/sveltejs/svelte/issues/18288)
		onMount(() => {
			items = [1];
		});

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			Child($$renderer, {});
		}

		$$renderer.push(`<!--]-->`);
	});
}
import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';

export default function Teardown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { callback } = $$props;

		onDestroy(() => {
			callback();
		});

		$$renderer.push(`<div>teardown</div>`);
	});
}
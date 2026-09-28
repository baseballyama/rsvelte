import * as $ from 'svelte/internal/server';
import { onMount, onDestroy } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let el;
		let parentEl;

		onMount(() => {
			parentEl = el.parentNode.host.parentElement;

			return () => {
				parentEl.dataset.onMountDestroyed = true;
			};
		});

		onDestroy(() => {
			parentEl.dataset.destroyed = true;
		});

		$$renderer.push(`<div></div>`);
	});
}
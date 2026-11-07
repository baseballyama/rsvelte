import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Gsap_box($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let animation;

		onMount(() => {
			animation = window.gsap.to('.box', { rotation: 180, x: 100, duration: 1 });
		});

		$$renderer.push(`<div class="container"><div class="box svelte-s15w6y"></div> <button class="svelte-s15w6y">Replay</button></div>`);
	});
}
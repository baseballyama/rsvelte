import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';

export default function Gsap_flip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		gsap.registerPlugin(Flip);

		let items = [...Array(10).keys()];

		// track `items` as a dependency
		// measure elements before the DOM updates
		// wait for the DOM update
		// do the FLIP animation
		function shuffle() {
			items = items.toSorted(() => Math.random() - 0.5);
		}

		$$renderer.push(`<div class="container"><div><div class="items svelte-r5xqhe"><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div class="item svelte-r5xqhe">${$.escape(item)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <button class="svelte-r5xqhe">Shuffle</button></div></div>`);
	});
}
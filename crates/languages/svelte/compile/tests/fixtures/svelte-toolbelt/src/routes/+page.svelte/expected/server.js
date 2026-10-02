import * as $ from 'svelte/internal/server';
import { box } from "$lib/box/box.svelte";
import { attachRef } from "$lib/utils/attach-ref.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ref = box(null);
		const props = { ...attachRef(ref) };
		let show = false;

		$$renderer.push(`<button>Toggle</button> `);

		if (show) {
			$$renderer.push(`<!--[0--><div${$.attributes({ ...props })}>Hello world</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
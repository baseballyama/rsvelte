import * as $ from 'svelte/internal/server';
import { fork } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let clicks = 0;
		let show = false;
		const derived = $.derived(() => clicks * 2);

		$$renderer.push(`<button>fork</button> <button>toggle</button> <button>clicks: ${$.escape(clicks)}</button> `);

		if (show) {
			$$renderer.push(`<!--[0--><p>${$.escape(derived())}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
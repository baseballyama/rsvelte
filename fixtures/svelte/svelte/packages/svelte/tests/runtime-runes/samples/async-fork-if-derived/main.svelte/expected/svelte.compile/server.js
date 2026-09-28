import * as $ from 'svelte/internal/server';
import { fork } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show = false;
		let count = 0;
		let d_count = $.derived(() => count);

		$$renderer.push(`<button>${$.escape(count)}</button> <button>toggle</button> `);

		if (show) {
			$$renderer.push(`<!--[0-->${$.escape(d_count())}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
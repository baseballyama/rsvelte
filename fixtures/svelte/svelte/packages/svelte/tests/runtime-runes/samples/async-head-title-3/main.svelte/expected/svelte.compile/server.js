import * as $ from 'svelte/internal/server';
import Inner from './Inner.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let deferred = [];
		let show = false;

		$$renderer.push(`<button>toggle</button> <button>resolve</button> `);

		if (show) {
			$$renderer.push('<!--[0-->');
			Inner($$renderer, { deferred, title: 'title' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
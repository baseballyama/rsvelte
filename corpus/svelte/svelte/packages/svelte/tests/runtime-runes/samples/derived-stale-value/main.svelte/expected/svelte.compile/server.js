import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		const derived = $.derived(() => Math.floor(count / 2));
		const derived2 = $.derived(() => derived() * 2);

		$$renderer.push(`<button>clicks: ${$.escape(count)}</button>`);
	});
}
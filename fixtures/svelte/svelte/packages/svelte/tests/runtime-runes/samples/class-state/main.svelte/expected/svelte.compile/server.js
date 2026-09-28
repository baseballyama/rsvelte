import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			count = 0;
		}

		const counter = new Counter();

		$$renderer.push(`<button>${$.escape(counter.count)}</button>`);
	});
}
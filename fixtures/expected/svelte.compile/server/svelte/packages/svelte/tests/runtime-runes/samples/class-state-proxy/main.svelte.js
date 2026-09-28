import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			count;

			constructor(v) {
				this.count = v;
			}
		}

		const counter = new Counter({ count: 0 });

		$$renderer.push(`<button>${$.escape(counter.count.count)}</button>`);
	});
}
import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Base {
			count = 0;
		}

		class Counter extends Base {
			constructor(initial) {
				super();
				this.count = initial;
			}
		}

		const counter = $.derived(() => new Counter(10));

		counter();
		$$renderer.push(`<button>${$.escape(counter().count)}</button>`);
	});
}
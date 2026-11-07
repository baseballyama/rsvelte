import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const logger = (obj) => {
			console.log(obj.count);
		};

		class Counter {
			count;
			#count;

			constructor(initial_count) {
				logger(this);
				this.count = initial_count;
			}
		}

		const counter = new Counter(0);

		$$renderer.push(`<button>${$.escape(counter.count)}</button>`);
	});
}
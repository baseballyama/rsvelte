import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			count = 0;
			#doubled = $.derived(() => this.count * 2);

			get doubled() {
				return this.#doubled();
			}

			set doubled($$value) {
				return this.#doubled($$value);
			}
		}

		const counter = new Counter();

		$$renderer.push(`<button>${$.escape(counter.count)}</button> <p>doubled: ${$.escape(counter.doubled)}</p>`);
	});
}
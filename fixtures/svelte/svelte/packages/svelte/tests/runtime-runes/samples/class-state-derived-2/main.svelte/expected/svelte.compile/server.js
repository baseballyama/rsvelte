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

			constructor(initialCount = 0) {
				this.count = initialCount;
			}
		}

		const counter = new Counter(1);

		$$renderer.push(`<!---->${$.escape(counter.doubled)}`);
		$.bind_props($$props, { Counter });
	});
}
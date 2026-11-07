import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			count = 0;
			#doubled = $.derived(() => this.count * 2);
			#tripled = $.derived(() => this.count * this.by);

			constructor(by) {
				this.by = by;
			}

			get embiggened1() {
				const self = this;

				return self.#doubled();
			}

			get embiggened2() {
				return this.#tripled();
			}
		}

		const counter = new Counter(3);

		$$renderer.push(`<button>${$.escape(counter.count)}</button> <p>doubled: ${$.escape(counter.embiggened1)}</p> <p>tripled: ${$.escape(counter.embiggened2)}</p>`);
	});
}
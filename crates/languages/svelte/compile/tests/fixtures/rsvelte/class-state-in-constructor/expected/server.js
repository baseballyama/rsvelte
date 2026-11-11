import * as $ from "svelte/internal/server";
export default function Class_state_in_constructor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			#sum;
			get sum() {
				return this.#sum();
			}
			set sum($$value) {
				return this.#sum($$value);
			}
			#a;
			#b = { val: -1 };
			constructor() {
				this.#a ||= { val: 0 };
				this.#b.val += 1;
				this.#sum = $.derived(() => this.#a.val + this.#b.val);
				this.copy = this.#b;
				this.later = () => this.#a;
				function nested(self) {
					return self.#b;
				}
				nested(this);
			}
			inc() {
				this.#a.val += 1;
			}
		}
		let counter = new Counter();
		$$renderer.push(`<button>${$.escape(counter.sum)}</button>`);
	});
}

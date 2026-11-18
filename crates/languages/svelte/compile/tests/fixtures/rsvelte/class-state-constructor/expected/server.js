import * as $ from "svelte/internal/server";
export default function Class_state_constructor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			count = 0;
			#priv = { a: 1 };
			#doubled = $.derived(() => this.count * 2);
			get doubled() {
				return this.#doubled();
			}
			set doubled($$value) {
				return this.#doubled($$value);
			}
			#tripled = $.derived(() => this.count * 3);
			get tripled() {
				return this.#tripled();
			}
			set tripled($$value) {
				return this.#tripled($$value);
			}
			static s = 1;
			plain = 2;
			constructor(x) {
				this.later = x;
				this.#other = [];
			}
			#other;
			inc() {
				this.count++;
				this.#priv = { a: 2 };
				this.#other.push(1);
			}
			get p() {
				return this.#priv.a;
			}
		}
		const c = new Counter(1);
		let obj = { k: class {
			v = 1;
		} };
		$$renderer.push(`<button>${$.escape(c.count)} ${$.escape(c.doubled)} ${$.escape(c.p)}</button>`);
	});
}

import * as $ from "svelte/internal/server";
export default function Class_state_keys($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class K {
			#e;
			get e() {
				return this.#e();
			}
			set e($$value) {
				return this.#e($$value);
			}
			"a b" = 1;
			#d = $.derived(() => this["a b"] * 2);
			constructor() {
				this[true] = 1;
				this[null] = 2;
				this[1n] = 3;
				this[16] = 4;
				this.#e = $.derived(() => this.#d() + 1);
			}
			m() {
				let local = 0;
				local++;
				this.#d(5);
				this.#d(this.#d() + 1);
				const Inner = class {
					#d = 1;
					read() {
						return this.#d;
					}
				};
				return [
					local,
					this.#d(),
					new Inner()
				];
			}
		}
		new K();
	});
}

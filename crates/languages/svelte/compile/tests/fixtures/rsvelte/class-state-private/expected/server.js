import * as $ from "svelte/internal/server";
export default function Class_state_private($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class A {
			#d;
			get d() {
				return this.#d();
			}
			set d($$value) {
				return this.#d($$value);
			}
			#count = 5;
			count;
			r = [1];
			o = { x: 1 };
			"a b" = 1;
			[k] = 1;
			constructor() {
				this.#d = $.derived(() => this.count + 1);
				this.#e = 3;
				this.#f = this.#e;
			}
			#e;
			#f;
			m(other) {
				this.r = [2];
				this.o = { y: 2 };
				this.#e += 1;
				this.#e++;
				--this.#e;
				this.#f = { z: 1 };
				this.#f ??= [];
				other.#e = 4;
				const t = this.#e;
				return t;
			}
		}
		const k = "k";
		new A();
	});
}

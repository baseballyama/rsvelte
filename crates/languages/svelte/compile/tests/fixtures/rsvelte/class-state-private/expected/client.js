import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export default function Class_state_private($$anchor, $$props) {
	$.push($$props, true);
	class A {
		#d;
		get d() {
			return $.get(this.#d);
		}
		set d(value) {
			$.set(this.#d, value);
		}
		#count = 5;
		#_count = $.state();
		get count() {
			return $.get(this.#_count);
		}
		set count(value) {
			$.set(this.#_count, value, true);
		}
		#r = $.state([1]);
		get r() {
			return $.get(this.#r);
		}
		set r(value) {
			$.set(this.#r, value);
		}
		#o = $.state($.proxy({ x: 1 }));
		get o() {
			return $.get(this.#o);
		}
		set o(value) {
			$.set(this.#o, value, true);
		}
		#a_b = $.state(1);
		get "a b"() {
			return $.get(this.#a_b);
		}
		set "a b"(value) {
			$.set(this.#a_b, value, true);
		}
		[k] = 1;
		constructor() {
			this.#d = $.derived(() => this.count + 1);
			this.#e = $.state(3);
			this.#f = $.state($.proxy(this.#e.v));
		}
		#e;
		#f;
		m(other) {
			this.r = [2];
			this.o = { y: 2 };
			$.set(this.#e, $.get(this.#e) + 1);
			$.update(this.#e);
			$.update_pre(this.#e, -1);
			$.set(this.#f, { z: 1 }, true);
			$.get(this.#f) ?? $.set(this.#f, [], true);
			$.set(other.#e, 4);
			const t = $.get(this.#e);
			return t;
		}
	}
	const k = "k";
	new A();
	$.pop();
}

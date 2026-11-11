import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export default function Class_state_keys($$anchor, $$props) {
	$.push($$props, true);
	class K {
		#true;
		get true() {
			return $.get(this.#true);
		}
		set true(value) {
			$.set(this.#true, value, true);
		}
		#null;
		get null() {
			return $.get(this.#null);
		}
		set null(value) {
			$.set(this.#null, value);
		}
		#_;
		get "1"() {
			return $.get(this.#_);
		}
		set "1"(value) {
			$.set(this.#_, value, true);
		}
		#_6;
		get "16"() {
			return $.get(this.#_6);
		}
		set "16"(value) {
			$.set(this.#_6, value, true);
		}
		#e;
		get e() {
			return $.get(this.#e);
		}
		set e(value) {
			$.set(this.#e, value);
		}
		#a_b = $.state(1);
		get "a b"() {
			return $.get(this.#a_b);
		}
		set "a b"(value) {
			$.set(this.#a_b, value, true);
		}
		#d = $.derived(() => this["a b"] * 2);
		constructor() {
			this.#true = $.state(1);
			this.#null = $.state(2);
			this.#_ = $.state(3);
			this.#_6 = $.state(4);
			this.#e = $.derived(() => $.get(this.#d) + 1);
		}
		m() {
			let local = $.state(0);
			$.update(local);
			$.set(this.#d, 5);
			$.set(this.#d, $.get(this.#d) + 1);
			const Inner = class {
				#d = 1;
				read() {
					return this.#d;
				}
			};
			return [
				$.get(local),
				$.get(this.#d),
				new Inner()
			];
		}
	}
	new K();
	$.pop();
}

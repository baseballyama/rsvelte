import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<button> </button>`);
export default function Class_state_in_constructor($$anchor, $$props) {
	$.push($$props, true);
	class Counter {
		#sum;
		get sum() {
			return $.get(this.#sum);
		}
		set sum(value) {
			$.set(this.#sum, value);
		}
		#copy;
		get copy() {
			return $.get(this.#copy);
		}
		set copy(value) {
			$.set(this.#copy, value, true);
		}
		#a = $.state();
		#b = $.state($.proxy({ val: -1 }));
		constructor() {
			this.#a.v || $.set(this.#a, { val: 0 }, true);
			this.#b.v.val += 1;
			this.#sum = $.derived(() => $.get(this.#a).val + $.get(this.#b).val);
			this.#copy = $.state($.proxy(this.#b.v));
			this.later = () => $.get(this.#a);
			function nested(self) {
				return $.get(self.#b);
			}
			nested(this);
		}
		inc() {
			$.get(this.#a).val += 1;
		}
	}
	let counter = new Counter();
	var button = root();
	var text = $.only_child(button, true);
	$.template_effect(() => $.set_text(text, counter.sum));
	$.delegated("click", button, () => counter.inc());
	$.append($$anchor, button);
	$.pop();
}
$.delegate(["click"]);

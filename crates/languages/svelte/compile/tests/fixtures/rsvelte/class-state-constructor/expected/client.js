import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<button> </button>`);
export default function Class_state_constructor($$anchor, $$props) {
	$.push($$props, true);
	class Counter {
		#later;
		get later() {
			return $.get(this.#later);
		}
		set later(value) {
			$.set(this.#later, value, true);
		}
		#count = $.state(0);
		get count() {
			return $.get(this.#count);
		}
		set count(value) {
			$.set(this.#count, value, true);
		}
		#priv = $.state({ a: 1 });
		#doubled = $.derived(() => this.count * 2);
		get doubled() {
			return $.get(this.#doubled);
		}
		set doubled(value) {
			$.set(this.#doubled, value);
		}
		#tripled = $.derived(() => this.count * 3);
		get tripled() {
			return $.get(this.#tripled);
		}
		set tripled(value) {
			$.set(this.#tripled, value);
		}
		static s = 1;
		plain = 2;
		constructor(x) {
			this.#later = $.state($.proxy(x));
			this.#other = $.state($.proxy([]));
		}
		#other;
		inc() {
			this.count++;
			$.set(this.#priv, { a: 2 });
			$.get(this.#other).push(1);
		}
		get p() {
			return $.get(this.#priv).a;
		}
	}
	const c = new Counter(1);
	let obj = { k: class {
		#v = $.state(1);
		get v() {
			return $.get(this.#v);
		}
		set v(value) {
			$.set(this.#v, value, true);
		}
	} };
	var button = root();
	var text = $.only_child(button);
	$.template_effect(() => $.set_text(text, `${c.count ?? ""} ${c.doubled ?? ""} ${c.p ?? ""}`));
	$.delegated("click", button, () => c.inc());
	$.append($$anchor, button);
	$.pop();
}
$.delegate(["click"]);

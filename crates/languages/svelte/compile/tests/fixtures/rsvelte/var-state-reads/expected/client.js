import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p></p>`);
export default function Var_state_reads($$anchor) {
	console.log(foo, $.safe_get(double));
	var foo = 10;
	var double = $.derived(() => foo * 2);
	console.log(foo, $.safe_get(double));
	function wrap(initial) {
		var _value = $.state($.proxy(initial));
		return {
			get() {
				return $.safe_get(_value);
			},
			set(state) {
				$.set(_value, state, true);
			}
		};
	}
	var wrapped = wrap(0);
	console.log(wrapped.get());
	wrapped.set(1);
	console.log(wrapped.get());
	var p = root();
	p.textContent = `${$.safe_get(double) ?? ""} 10`;
	$.append($$anchor, p);
}

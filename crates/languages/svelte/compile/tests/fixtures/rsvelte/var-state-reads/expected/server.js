import * as $ from "svelte/internal/server";
export default function Var_state_reads($$renderer) {
	console.log(foo, double?.());
	var foo = 10;
	var double = $.derived(() => foo * 2);
	console.log(foo, double?.());
	function wrap(initial) {
		var _value = initial;
		return {
			get() {
				return _value;
			},
			set(state) {
				_value = state;
			}
		};
	}
	var wrapped = wrap(0);
	console.log(wrapped.get());
	wrapped.set(1);
	console.log(wrapped.get());
	$$renderer.push(`<p>20 10</p>`);
}

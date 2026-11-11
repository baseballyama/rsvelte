import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<input/> <input/> <!> <div></div>`, 1);
export default function Bind_derived($$anchor) {
	let n = 1;
	let d = $.derived(() => n * 2);
	let e = $.derived(() => n);
	let o = $.derived(() => ({ a: n }));
	var fragment = root();
	var input = $.first_child(fragment);
	$.remove_input_defaults(input);
	var input_1 = $.sibling(input, 2);
	$.remove_input_defaults(input_1);
	var node = $.sibling(input_1, 2);
	C(node, {
		get value() {
			return $.get(e);
		},
		set value($$value) {
			$.set(e, $$value);
		}
	});
	var div = $.sibling(node, 2);
	$.bind_this(div, ($$value) => $.set(d, $$value), () => $.get(d));
	$.bind_value(input, () => $.get(d), ($$value) => $.set(d, $$value));
	$.bind_value(input_1, () => $.get(o).a, ($$value) => $.get(o).a = $$value);
	$.append($$anchor, fragment);
}

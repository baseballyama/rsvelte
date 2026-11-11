import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export const answer = 42;
export function double(n) {
	return n * 2;
}
var root = $.from_html(`<input/>`);
export default function Exports($$anchor) {
	let value = $.state("");
	var input = root();
	$.remove_input_defaults(input);
	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, input);
}

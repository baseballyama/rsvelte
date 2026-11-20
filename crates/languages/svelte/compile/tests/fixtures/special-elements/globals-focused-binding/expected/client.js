import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<input/>`);
export default function Globals_focused_binding($$anchor) {
	let focused = $.state(false);
	var input = root();
	$.bind_focused($.window, ($$value) => $.set(focused, $$value, true));
	$.bind_focused($.document, ($$value) => $.set(focused, $$value, true));
	$.bind_focused(input, ($$value) => $.set(focused, $$value));
	$.append($$anchor, input);
}

import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<div></div>`);
export default function Const_initialized_by_itself($$anchor) {
	const cyclic = cyclic;
	var div = root();
	$.set_attribute(div, "id", cyclic);
	$.append($$anchor, div);
}

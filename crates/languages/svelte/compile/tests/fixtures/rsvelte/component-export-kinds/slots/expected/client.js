import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export default function Slots($$anchor, $$props) {
	let x = 1;
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.slot(node, $$props, "a", { v: x }, null);
	$.append($$anchor, fragment);
}

import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export const answer = 42;
export function double(n) {
	return n * 2;
}
export default function Exports($$anchor) {
	let value = "";
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => "p", false, ($$element, $$anchor) => {
		var text = $.text();
		text.nodeValue = "";
		$.append($$anchor, text);
	});
	$.append($$anchor, fragment);
}

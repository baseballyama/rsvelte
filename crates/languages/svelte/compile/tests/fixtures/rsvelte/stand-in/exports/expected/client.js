import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export const answer = 42;
export function double(n) {
	return n * 2;
}
var root = $.from_html(`<p><!></p>`);
export default function Exports($$anchor) {
	let value = "";
	var p = root();
	$.set_attribute(p, "title", value);
	var node = $.child(p);
	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);
			Exports(node_1, {});
			$.append($$anchor, fragment);
		};
		$.if(node, ($$render) => {
			if (value) $$render(consequent);
		});
	}
	$.reset(p);
	$.append($$anchor, p);
}

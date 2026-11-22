import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<div></div>`);
export default function Space($$anchor) {
	function f(node, p) {
		return {};
	}
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);
	$.each(node_1, 24, () => [1], (x) => x, ($$anchor, x) => {
		var div = root();
		$.animation(div, () => f, null);
		$.append($$anchor, div);
	});
	$.append($$anchor, fragment);
}

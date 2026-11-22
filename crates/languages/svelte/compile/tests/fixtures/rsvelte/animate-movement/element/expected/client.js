import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export default function Element($$anchor) {
	function f(node, p) {
		return {};
	}
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);
	$.each(node_1, 24, () => [1], (x) => x, ($$anchor, x) => {
		var fragment_1 = $.comment();
		var node_2 = $.first_child(fragment_1);
		$.element(node_2, () => "div", false, ($$element, $$anchor) => {
			$.animation($$element, () => f, null);
		});
		$.append($$anchor, fragment_1);
	});
	$.append($$anchor, fragment);
}

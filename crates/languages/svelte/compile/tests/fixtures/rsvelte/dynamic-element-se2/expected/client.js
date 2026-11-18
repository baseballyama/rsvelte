import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<!> <!>`, 1);
export default function Dynamic_element_se2($$anchor) {
	let tag = "div";
	let c = "red";
	var fragment = root();
	var node = $.first_child(fragment);
	$.element(node, () => tag, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({
			id: "a",
			class: "",
			style: "",
			[$.CLASS]: { x: c },
			[$.STYLE]: { color: c }
		}), void 0, void 0, void 0, "svelte-2o06j");
	});
	var node_1 = $.sibling(node, 2);
	$.element(node_1, () => tag, false, ($$element_1, $$anchor) => {
		$.attribute_effect($$element_1, () => ({
			id: "b",
			class: ""
		}), void 0, void 0, void 0, "svelte-2o06j");
	});
	$.append($$anchor, fragment);
}

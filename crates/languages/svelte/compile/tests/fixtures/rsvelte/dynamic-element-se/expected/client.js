import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<!> <!> <!>`, 1);
export default function Dynamic_element_se($$anchor, $$props) {
	let tag = "div";
	let c = "red";
	var fragment = root();
	var node = $.first_child(fragment);
	$.element(node, () => tag, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({
			style: "",
			[$.STYLE]: {
				color: c,
				width: "1px",
				"--x": c
			}
		}));
	});
	var node_1 = $.sibling(node, 2);
	$.element(node_1, () => tag, false, ($$element_1, $$anchor) => {
		$.attribute_effect($$element_1, () => ({
			...$$props.p,
			style: "a: b",
			[$.STYLE]: [{}, { color: c }]
		}));
	});
	var node_2 = $.sibling(node_1, 2);
	$.element(node_2, () => tag, false, ($$element_2, $$anchor) => {
		$.attribute_effect($$element_2, () => ({
			style: "margin: 0",
			[$.STYLE]: { color: c }
		}));
		var text = $.text("x");
		$.append($$anchor, text);
	});
	$.append($$anchor, fragment);
}

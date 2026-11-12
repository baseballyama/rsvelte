import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
export default function Dynamic_element_is_attribute($$anchor) {
	let tt;
	let v;
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => tt, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({
			is: "plain",
			defaultValue: "1"
		}));
	});
	$.append($$anchor, fragment);
}

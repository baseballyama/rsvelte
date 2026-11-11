import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export default function Element_bind_this_prop($$anchor, $$props) {
	$.push($$props, true);
	let ref = $.prop($$props, "ref", 15, null);
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => "div", false, ($$element, $$anchor) => {
		$.bind_this($$element, ($$value) => ref($$value), () => ref());
	});
	$.append($$anchor, fragment);
	$.pop();
}

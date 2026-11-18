import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var rest_excludes = new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
var root = $.from_html(`<button is="x-button">a</button> <button is="x-button">b</button>`, 3);
export default function Custom_element_is_spread($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	$.attribute_effect(button_1, () => ({ ...props }));
	$.append($$anchor, fragment);
}

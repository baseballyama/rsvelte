import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p></p> <p></p>`, 1);
export default function Custom_element_state_is_a_source($$anchor) {
	let n = $.state(1);
	let d = $.derived(() => 2);
	var fragment = root();
	var p = $.first_child(fragment);
	p.textContent = $.get(n);
	var p_1 = $.sibling(p, 2);
	$.set_attribute(p_1, "title", $.get(d));
	$.append($$anchor, fragment);
}
customElements.define("my-el", $.create_custom_element(Custom_element_state_is_a_source, {}, [], [], { mode: "open" }));

import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<my-el></my-el> <my-el></my-el> <my-el></my-el> <my-el></my-el> <my-el></my-el> <my-el></my-el> <div><my-el></my-el></div>`, 3);
export default function Scoped_custom_element($$anchor, $$props) {
	let c = "a";
	var fragment = root();
	var my_el = $.first_child(fragment);
	$.set_class(my_el, 1, "svelte-md0yph");
	var my_el_1 = $.sibling(my_el, 2);
	$.set_custom_element_data(my_el_1, "id", "x");
	$.set_class(my_el_1, 1, "svelte-md0yph");
	var my_el_2 = $.sibling(my_el_1, 2);
	$.set_class(my_el_2, 1, "k svelte-md0yph");
	var my_el_3 = $.sibling(my_el_2, 2);
	$.set_class(my_el_3, 1, $.clsx(c), "svelte-md0yph");
	var my_el_4 = $.sibling(my_el_3, 2);
	$.set_class(my_el_4, 1, "svelte-md0yph", null, {}, { on: c });
	var my_el_5 = $.sibling(my_el_4, 2);
	$.attribute_effect(my_el_5, () => ({ ...$$props.p }), void 0, void 0, void 0, "svelte-md0yph");
	var div = $.sibling(my_el_5, 2);
	var my_el_6 = $.child(div);
	$.set_custom_element_data(my_el_6, "a", c);
	$.set_class(my_el_6, 1, "svelte-md0yph");
	$.reset(div);
	$.append($$anchor, fragment);
}

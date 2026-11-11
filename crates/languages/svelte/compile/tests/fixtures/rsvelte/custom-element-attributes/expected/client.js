import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<my-el></my-el> <lite-youtube></lite-youtube> <x-foo><span> </span></x-foo> <x-bar></x-bar> <div is="my-div"></div> <x-baz></x-baz> <p is="my-p"></p> <x-qux></x-qux>`, 3);
export default function Custom_element_attributes($$anchor, $$props) {
	let v = $.prop($$props, "v", 3, 1), o = $.prop($$props, "o", 7);
	let s = $.state(2);
	var fragment = root();
	var my_el = $.first_child(fragment);
	$.set_custom_element_data(my_el, "a", "1");
	$.template_effect(() => $.set_custom_element_data(my_el, "b", v()));
	$.template_effect(() => $.set_custom_element_data(my_el, "c", $.get(s)));
	$.set_class(my_el, 1, "x");
	$.set_style(my_el, "color: red");
	var lite_youtube = $.sibling(my_el, 2);
	$.set_custom_element_data(lite_youtube, "videoid", "abc");
	$.template_effect(() => $.set_custom_element_data(lite_youtube, "params", `x=${v() ?? ""}`));
	var x_foo = $.sibling(lite_youtube, 2);
	$.attribute_effect(x_foo, () => ({
		...o(),
		d: $.get(s)
	}));
	var span = $.child(x_foo);
	var text = $.only_child(span, true);
	$.reset(x_foo);
	var x_bar = $.sibling(x_foo, 2);
	$.bind_this(x_bar, ($$value) => o($$value), () => o());
	var div = $.sibling(x_bar, 2);
	$.template_effect(() => $.set_custom_element_data(div, "title", v()));
	var x_baz = $.sibling(div, 2);
	$.template_effect(() => $.set_custom_element_data(x_baz, "data-a", $.get(s)));
	let classes;
	$.set_style(x_baz, "", {}, { color: "red" });
	var p = $.sibling(x_baz, 2);
	$.set_custom_element_data(p, "title", "t");
	$.template_effect(($0) => $.set_custom_element_data(p, "data-x", $0), [() => Math.max(v(), 1)]);
	$.set_custom_element_data(p, "fooBar", "Q");
	var x_qux = $.sibling(p, 2);
	$.attribute_effect(x_qux, () => ({
		...o(),
		fooBar: "Q"
	}));
	$.template_effect(() => {
		$.set_text(text, $.get(s));
		classes = $.set_class(x_baz, 1, "", null, classes, { active: $.get(s) });
	});
	$.delegated("click", my_el, () => $.update(s));
	$.append($$anchor, fragment);
}
$.delegate(["click"]);

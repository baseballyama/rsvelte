import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<!> <!> <p> </p>`, 1);
export default function Element_bindings_on_special_hosts($$anchor) {
	let w = $.state(0);
	let item = $.proxy({ w: 0 });
	let tag = "div";
	let h = $.state("");
	var fragment = root();
	$.bind_this($.document.body, ($$value) => $.set(w, $$value, true), () => $.get(w));
	var node = $.first_child(fragment);
	$.element(node, () => tag, false, ($$element, $$anchor) => {
		$.bind_element_size($$element, "clientWidth", ($$value) => $.set(w, $$value, true));
		$.bind_focused($$element, ($$value) => $.set(w, $$value, true));
		var text = $.text("x");
		$.append($$anchor, text);
	});
	var node_1 = $.sibling(node, 2);
	$.element(node_1, () => tag, false, ($$element_1, $$anchor) => {
		$.attribute_effect($$element_1, () => ({ contenteditable: "true" }));
		$.bind_content_editable("innerHTML", $$element_1, () => $.get(h), ($$value) => $.set(h, $$value, true));
		var text_1 = $.text("y");
		$.append($$anchor, text_1);
	});
	var p = $.sibling(node_1, 2);
	var text_2 = $.only_child(p);
	$.template_effect(() => $.set_text(text_2, `${$.get(w) ?? ""}${$.get(h) ?? ""}${item.w ?? ""}`));
	$.bind_element_size($.document.body, "clientWidth", ($$value) => $.set(w, $$value, true));
	$.bind_element_size($.document.body, "offsetHeight", ($$value) => item.w = $$value);
	$.bind_resize_observer($.document.body, "contentRect", ($$value) => $.set(w, $$value, true));
	$.bind_focused($.document.body, ($$value) => $.set(w, $$value, true));
	$.append($$anchor, fragment);
}

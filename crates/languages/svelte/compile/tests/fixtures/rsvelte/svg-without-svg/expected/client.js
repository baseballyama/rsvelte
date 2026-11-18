import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_svg(`<line y2="10" stroke-width="2"></line><text dominant-baseline="hanging"> </text>`, 1);
var root_1 = $.from_svg(`<g class="axis"><!><linearGradient id="g" gradientUnits="userSpaceOnUse"><stop offset="0"></stop></linearGradient></g><path d="M0 0"></path>`, 1);
export default function Svg_without_svg($$anchor, $$props) {
	let x = $.prop($$props, "x", 3, 1), items = $.prop($$props, "items", 19, () => []), fill = $.prop($$props, "fill", 3, "red");
	var fragment = root_1();
	var g = $.first_child(fragment);
	var node = $.child(g);
	$.each(node, 17, items, $.index, ($$anchor, item) => {
		var fragment_1 = root();
		var line = $.first_child(fragment_1);
		var text = $.sibling(line);
		$.set_attribute(text, "textLength", 10);
		var text_1 = $.only_child(text, true);
		$.template_effect(() => {
			$.set_attribute(line, "x1", $.get(item));
			$.set_attribute(line, "x2", $.get(item));
			$.set_text(text_1, $.get(item));
		});
		$.append($$anchor, fragment_1);
	});
	var linearGradient = $.sibling(node);
	var stop = $.only_child(linearGradient);
	$.reset(g);
	var path = $.sibling(g);
	$.template_effect(() => {
		$.set_attribute(g, "transform", `translate(${x() ?? ""}, 0)`);
		$.set_attribute(stop, "stop-color", fill());
		$.set_attribute(path, "fill", fill());
	});
	$.append($$anchor, fragment);
}

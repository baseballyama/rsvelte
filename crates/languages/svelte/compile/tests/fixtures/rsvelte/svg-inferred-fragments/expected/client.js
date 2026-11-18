import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
const dot = ($$anchor, r = $.noop) => {
	var circle = root();
	$.template_effect(() => $.set_attribute(circle, "r", r()));
	$.append($$anchor, circle);
};
var root = $.from_svg(`<circle></circle>`);
var root_1 = $.from_svg(`<rect width="1"></rect><!>`, 1);
var root_2 = $.from_svg(`<circle r="1"></circle>`);
var root_3 = $.from_svg(`<ellipse rx="1"></ellipse>`);
var root_4 = $.from_html(`<!> <div><path d="M0 0" viewbox="0 0 1 1"></path></div> <svg viewBox="0 0 1 1"><foo><!></foo></svg> <!>`, 1);
export default function Svg_inferred_fragments($$anchor, $$props) {
	let show = $.prop($$props, "show", 3, true), label = $.prop($$props, "label", 3, "a");
	var fragment = root_4();
	var node = $.first_child(fragment);
	C(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var rect = $.first_child(fragment_1);
			var node_1 = $.sibling(rect);
			dot(node_1, () => 2);
			$.template_effect(() => $.set_attribute(rect, "height", show() ? 1 : 2));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
	var div = $.sibling(node, 2);
	var path = $.only_child(div);
	var svg = $.sibling(div, 2);
	var foo = $.child(svg);
	var node_2 = $.child(foo);
	{
		var consequent = ($$anchor) => {
			var circle_1 = root_2();
			$.append($$anchor, circle_1);
		};
		$.if(node_2, ($$render) => {
			if (show()) $$render(consequent);
		});
	}
	$.reset(foo);
	$.reset(svg);
	var node_3 = $.sibling(svg, 2);
	{
		var consequent_1 = ($$anchor) => {
			var ellipse = root_3();
			$.append($$anchor, ellipse);
		};
		$.if(node_3, ($$render) => {
			if (show()) $$render(consequent_1);
		});
	}
	$.template_effect(() => $.set_class(path, 1, $.clsx(label())));
	$.append($$anchor, fragment);
}

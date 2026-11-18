import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<p>child</p>`);
var root_1 = $.from_svg(`<g><!></g><svg><g><!></g></svg><g><!></g><g><!></g>`, 1);
export default function Css_props_component($$anchor, $$props) {
	let color = $.prop($$props, "color", 3, "red");
	let n = 1;
	var fragment = root_1();
	var node = $.first_child(fragment);
	{
		$.css_props(node, () => ({
			"--color": color(),
			"--size": "2px"
		}));
		C(node.lastChild, { a: 1 });
		$.reset(node);
	}
	var svg = $.sibling(node);
	var node_1 = $.child(svg);
	{
		$.css_props(node_1, () => ({
			"--fill": "blue",
			"--w": n
		}));
		C(node_1.lastChild, {});
		$.reset(node_1);
	}
	$.reset(svg);
	var node_2 = $.sibling(svg);
	{
		$.css_props(node_2, () => ({ "--x": "1" }));
		$.component(node_2.lastChild, () => $$props.Dyn, ($$anchor, Dyn_1) => {
			Dyn_1($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var p = root();
					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});
		});
		$.reset(node_2);
	}
	var node_3 = $.sibling(node_2);
	{
		$.css_props(node_3, () => ({ "--y": n }));
		$.component(node_3.lastChild, () => $$props.Dyn, ($$anchor, $$component) => {
			$$component($$anchor, {});
		});
		$.reset(node_3);
	}
	$.append($$anchor, fragment);
}

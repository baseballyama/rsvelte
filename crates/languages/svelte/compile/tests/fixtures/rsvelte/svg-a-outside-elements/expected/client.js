import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Chart from "./Chart.svelte";
var root = $.from_svg(`<a href="/x"><tspan>x</tspan></a>`);
var root_1 = $.from_svg(`<a href="/y"><circle r="1"></circle></a>`);
var root_2 = $.from_html(`<svg><!></svg> <!> <a href="/z"><b>z</b></a>`, 1);
export default function Svg_a_outside_elements($$anchor) {
	var fragment = root_2();
	var svg = $.first_child(fragment);
	{
		const link = ($$anchor) => {
			var a = root();
			$.append($$anchor, a);
		};
		var node = $.child(svg);
		link(node);
		$.reset(svg);
	}
	var node_1 = $.sibling(svg, 2);
	Chart(node_1, {
		children: ($$anchor, $$slotProps) => {
			var a_1 = root_1();
			$.append($$anchor, a_1);
		},
		$$slots: { default: true }
	});
	$.next(2);
	$.append($$anchor, fragment);
}

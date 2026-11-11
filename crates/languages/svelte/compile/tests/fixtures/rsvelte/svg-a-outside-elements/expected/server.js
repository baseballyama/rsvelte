import * as $ from "svelte/internal/server";
import Chart from "./Chart.svelte";
export default function Svg_a_outside_elements($$renderer) {
	function link($$renderer) {
		$$renderer.push(`<a href="/x"><tspan>x</tspan></a>`);
	}
	$$renderer.push(`<svg>`);
	link($$renderer);
	$$renderer.push(`<!----></svg> `);
	Chart($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<a href="/y"><circle r="1"></circle></a>`);
		},
		$$slots: { default: true }
	});
	$$renderer.push(`<!----> <a href="/z"><b>z</b></a>`);
}

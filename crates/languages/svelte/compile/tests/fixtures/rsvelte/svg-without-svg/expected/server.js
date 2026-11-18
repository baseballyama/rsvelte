import * as $ from "svelte/internal/server";
export default function Svg_without_svg($$renderer, $$props) {
	let { x = 1, items = [], fill = "red" } = $$props;
	$$renderer.push(`<g class="axis"${$.attr("transform", `translate(${$.stringify(x)}, 0)`)}><!--[-->`);
	const each_array = $.ensure_array_like(items);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		$$renderer.push(`<line${$.attr("x1", item)}${$.attr("x2", item)} y2="10" stroke-width="2"></line><text dominant-baseline="hanging"${$.attr("textLength", 10)}>${$.escape(item)}</text>`);
	}
	$$renderer.push(`<!--]--><linearGradient id="g" gradientUnits="userSpaceOnUse"><stop offset="0"${$.attr("stop-color", fill)}></stop></linearGradient></g><path d="M0 0"${$.attr("fill", fill)}></path>`);
}

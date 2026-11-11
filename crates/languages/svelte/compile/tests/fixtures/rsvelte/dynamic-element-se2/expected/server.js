import * as $ from "svelte/internal/server";
export default function Dynamic_element_se2($$renderer) {
	let tag = "div";
	let c = "red";
	$.element($$renderer, tag, () => {
		$$renderer.push(` id="a"${$.attr_class("svelte-2o06j", void 0, { "x": c })}${$.attr_style("", { color: c })}`);
	});
	$$renderer.push(` `);
	$.element($$renderer, tag, () => {
		$$renderer.push(` id="b" class="svelte-2o06j"`);
	});
}

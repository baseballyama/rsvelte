import * as $ from "svelte/internal/server";
export default function Dynamic_element_se($$renderer, $$props) {
	let tag = "div";
	let c = "red";
	let { p } = $$props;
	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr_style("", {
			color: c,
			width: "1px",
			"--x": c
		})}`);
	});
	$$renderer.push(` `);
	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attributes({
			...p,
			style: "a: b"
		}, void 0, void 0, { color: c })}`);
	});
	$$renderer.push(` `);
	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr_style("margin: 0", { color: c })}`);
	}, () => {
		$$renderer.push(`x`);
	});
}

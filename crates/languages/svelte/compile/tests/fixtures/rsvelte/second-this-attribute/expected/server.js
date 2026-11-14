import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Second_this_attribute($$renderer) {
	let tag = "div";
	let tag2 = "span";
	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr("this", tag2)}`);
	}, () => {
		$$renderer.push(`x`);
	});
	$$renderer.push(` `);
	if (C) {
		$$renderer.push("<!--[-->");
		C($$renderer, { this: C });
		$$renderer.push("<!--]-->");
	} else {
		$$renderer.push("<!--[!-->");
		$$renderer.push("<!--]-->");
	}
}

import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Dynamic_element_is_attribute($$renderer) {
	let tt;
	let v;
	$.element($$renderer, tt, () => {
		$$renderer.push(` is="plain"`);
	});
}

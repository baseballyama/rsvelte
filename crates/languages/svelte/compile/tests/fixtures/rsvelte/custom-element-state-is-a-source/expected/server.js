import * as $ from "svelte/internal/server";
export default function Custom_element_state_is_a_source($$renderer) {
	let n = 1;
	let d = $.derived(() => 2);
	$$renderer.push(`<p>1</p> <p${$.attr("title", d())}></p>`);
}

import * as $ from "svelte/internal/server";
export default function Const_initialized_by_itself($$renderer) {
	const cyclic = cyclic;
	$$renderer.push(`<div${$.attr("id", cyclic)}></div>`);
}

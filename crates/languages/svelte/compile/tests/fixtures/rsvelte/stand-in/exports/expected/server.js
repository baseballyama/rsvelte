import * as $ from "svelte/internal/server";
export const answer = 42;
export function double(n) {
	return n * 2;
}
export default function Exports($$renderer) {
	let value = "";
	$$renderer.push(`<p${$.attr_style("", { color: value })}></p>`);
}

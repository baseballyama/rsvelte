import * as $ from "svelte/internal/server";
export default function Events($$renderer) {
	let x = 1;
	$$renderer.push(`<p>1</p>`);
}

import * as $ from "svelte/internal/server";
export default function Element_dir($$renderer) {
	let count = 0;
	$$renderer.push(`<div dir="auto">0</div> <p dir="rtl">static</p>`);
}

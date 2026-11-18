import * as $ from "svelte/internal/server";
export default function Debug_tag_dynamic_by_identifiers($$renderer) {
	let a = 1;
	$$renderer.push(`<div>`);
	console.log({});
	debugger;
	$$renderer.push(`</div> <p>`);
	console.log({ a });
	debugger;
	$$renderer.push(`</p>`);
}

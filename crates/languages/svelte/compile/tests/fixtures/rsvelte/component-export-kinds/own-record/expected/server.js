import * as $ from "svelte/internal/server";
export default function Own_record($$renderer) {
	let r = { own: true };
	$$renderer.push(`<p>${$.escape(r.own)}</p>`);
}

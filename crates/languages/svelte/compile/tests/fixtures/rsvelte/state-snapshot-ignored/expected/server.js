import * as $ from "svelte/internal/server";
export default function State_snapshot_ignored($$renderer) {
	let value = { f: () => {} };
	const copy = $.snapshot(value);
	$$renderer.push(`<p>${$.escape(copy.f)}</p>`);
}

import * as $ from "svelte/internal/server";
export default function State_snapshot_in_template($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = [1, 2];
		$$renderer.push(`<p>${$.escape($.snapshot(items).length)}</p>`);
	});
}

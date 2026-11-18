import * as $ from "svelte/internal/server";
export default function Effect_root_snapshot($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = [1, 2];
		const cleanup = () => {};
		function copy() {
			return $.snapshot(items);
		}
		$$renderer.push(`<button>${$.escape(copy().length)}</button>`);
	});
}

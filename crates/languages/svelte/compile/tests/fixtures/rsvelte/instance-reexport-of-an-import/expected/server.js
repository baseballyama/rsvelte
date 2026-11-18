import * as $ from "svelte/internal/server";
import { helper } from "./helper.js";
export default function Instance_reexport_of_an_import($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const label = helper();
		$$renderer.push(`<span>${$.escape(label)}</span>`);
		$.bind_props($$props, {
			helper,
			alias: helper
		});
	});
}

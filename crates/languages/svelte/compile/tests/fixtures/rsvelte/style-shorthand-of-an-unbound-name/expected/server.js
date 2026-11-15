import * as $ from "svelte/internal/server";
import { writable } from "svelte/store";
export default function Style_shorthand_of_an_unbound_name($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = writable("v");
		const color = "red";
		let { size } = $$props;
		$$renderer.push(`<div${$.attr_style("", { $store })}>x</div> <p${$.attr_style("", {
			color,
			size,
			width
		})}>y</p>`);
		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}

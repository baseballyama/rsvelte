import * as $ from 'svelte/internal/server';
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

export default function Data_table_checkbox($$renderer, $$props) {
	let {
		checked = false,
		onCheckedChange = (v) => checked = v,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		var bind_get = () => checked;
		var bind_set = onCheckedChange;

		Checkbox($$renderer, $.spread_props([
			{
				get checked() {
					return bind_get();
				},

				set checked($$value) {
					bind_set($$value);
				}
			},
			restProps
		]));
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
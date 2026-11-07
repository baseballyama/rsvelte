import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'checked',
	'onCheckedChange'
]);

export default function Data_table_checkbox($$anchor, $$props) {
	let checked = $.prop($$props, 'checked', 7, false),
		onCheckedChange = $.prop($$props, 'onCheckedChange', 3, (v) => checked(v)),
		restProps = $.rest_props($$props, rest_excludes);

	var bind_get = () => checked();
	var bind_set = onCheckedChange();

	Checkbox($$anchor, $.spread_props(
		{
			get checked() {
				return bind_get();
			},

			set checked($$value) {
				bind_set($$value);
			}
		},
		() => restProps
	));
}
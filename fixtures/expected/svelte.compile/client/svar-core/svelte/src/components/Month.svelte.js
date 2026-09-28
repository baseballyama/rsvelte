import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Locale from "../Locale.svelte";
import Month from "./calendar/Month.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Month_1($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	Locale($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, $.spread_props(() => props));
		},
		$$slots: { default: true }
	});
}
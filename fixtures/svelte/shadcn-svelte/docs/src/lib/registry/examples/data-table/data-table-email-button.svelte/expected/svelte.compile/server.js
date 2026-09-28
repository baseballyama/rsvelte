import * as $ from 'svelte/internal/server';
import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Data_table_email_button($$renderer, $$props) {
	let { variant = "ghost", $$slots, $$events, ...restProps } = $$props;

	Button($$renderer, $.spread_props([
		{ variant },
		restProps,
		{
			children: ($$renderer) => {
				$$renderer.push(`<!---->Email `);
				ArrowUpDownIcon($$renderer, { class: 'ms-2 size-4' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		}
	]));
}
import * as $ from 'svelte/internal/server';
import Badge from "$lib/components/ui/badge.svelte";
import { cn } from "$lib/utils/styles.js";

export default function Props_bindable_badge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		Badge($$renderer, $.spread_props([
			{
				class: cn("bg-background border border-[#2A266B] text-[#2A266B] dark:border-[#FCDAFE] dark:text-[#FCDAFE]", className)
			},
			restProps,
			{
				children: ($$renderer) => {
					$$renderer.push(`<!---->$bindable`);
				},
				$$slots: { default: true }
			}
		]));
	});
}
import * as $ from 'svelte/internal/server';
import Badge from "$lib/components/ui/badge.svelte";
import { cn } from "$lib/utils/styles.js";

export default function Props_required_badge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		Badge($$renderer, $.spread_props([
			{
				class: cn("border-destructive bg-background text-destructive border", className)
			},
			restProps,
			{
				children: ($$renderer) => {
					$$renderer.push(`<!---->required`);
				},
				$$slots: { default: true }
			}
		]));
	});
}
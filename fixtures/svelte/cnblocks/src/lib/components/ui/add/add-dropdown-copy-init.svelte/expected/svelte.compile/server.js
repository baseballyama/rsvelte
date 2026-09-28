import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import { useAddDropdownCopyInit } from "./add.svelte.js";
import { mergeProps } from "bits-ui";
import { cn } from "$lib/utils";

export default function Add_dropdown_copy_init($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...rest } = $$props;
		const dropdownCopyInitState = useAddDropdownCopyInit();
		const mergedProps = $.derived(() => mergeProps(rest, dropdownCopyInitState.props));

		if (DropdownMenu.Item) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Item($$renderer, $.spread_props([
				{
					class: cn("flex flex-col place-items-start! gap-1", className)
				},
				mergedProps(),
				{
					children: ($$renderer) => {
						$$renderer.push(`<span class="text-xs">${$.escape(dropdownCopyInitState.root.initCommand)}</span> <span class="text-start text-xs text-muted-foreground">Init registry</span>`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}
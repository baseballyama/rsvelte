import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'inset',
	'variant',
	'class'
]);

export default function Picker_item($$anchor, $$props) {
	$.push($$props, true);

	let variant = $.prop($$props, 'variant', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-hidden select-none focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 data-inset:pl-8 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [[data-slot=dropdown-menu-sub-content]_&]:focus:bg-accent [[data-slot=dropdown-menu-sub-content]_&]:focus:text-accent-foreground [[data-slot=dropdown-menu-sub-content]_&]:focus:**:text-accent-foreground", $$props.class));

		$.component(node, () => DropdownMenuPrimitive.Item, ($$anchor, DropdownMenuPrimitive_Item) => {
			DropdownMenuPrimitive_Item($$anchor, $.spread_props(
				{
					'data-slot': 'dropdown-menu-item',
					get 'data-inset'() {
						return $$props.inset;
					},

					get 'data-variant'() {
						return variant();
					},

					get class() {
						return $.get($0);
					}
				},
				() => restProps
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
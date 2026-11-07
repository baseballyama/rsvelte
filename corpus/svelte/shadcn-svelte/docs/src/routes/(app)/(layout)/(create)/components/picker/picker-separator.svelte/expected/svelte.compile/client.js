import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Picker_separator($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("-mx-1.5 my-1.5 h-px bg-neutral-600 dark:bg-neutral-700 [[data-slot=dropdown-menu-sub-content]_&]:bg-border", $$props.class));

		$.component(node, () => DropdownMenuPrimitive.Separator, ($$anchor, DropdownMenuPrimitive_Separator) => {
			DropdownMenuPrimitive_Separator($$anchor, $.spread_props(
				{
					'data-slot': 'dropdown-menu-separator',
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
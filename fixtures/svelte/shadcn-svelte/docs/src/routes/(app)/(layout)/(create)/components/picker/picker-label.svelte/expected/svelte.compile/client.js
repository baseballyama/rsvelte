import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'inset', 'class']);

export default function Picker_label($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("px-2 py-1.5 text-xs font-medium text-neutral-400 data-inset:pl-8", $$props.class));

		$.component(node, () => DropdownMenuPrimitive.GroupHeading, ($$anchor, DropdownMenuPrimitive_GroupHeading) => {
			DropdownMenuPrimitive_GroupHeading($$anchor, $.spread_props(
				{
					'data-slot': 'dropdown-menu-label',
					get 'data-inset'() {
						return $$props.inset;
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
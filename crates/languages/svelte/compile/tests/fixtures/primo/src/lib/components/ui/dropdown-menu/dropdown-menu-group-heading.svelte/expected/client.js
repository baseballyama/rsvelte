import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.ts';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'inset']);

export default function Dropdown_menu_group_heading($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('px-2 py-1.5 text-sm font-semibold', $$props.inset && 'pl-8', $$props.class));

		$.component(node, () => DropdownMenuPrimitive.GroupHeading, ($$anchor, DropdownMenuPrimitive_GroupHeading) => {
			DropdownMenuPrimitive_GroupHeading($$anchor, $.spread_props(
				{
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
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'inset']);

export default function Context_menu_group_heading($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("px-2 py-1.5 text-sm font-medium text-foreground data-inset:ps-8", $$props.class));

		$.component(node, () => ContextMenuPrimitive.GroupHeading, ($$anchor, ContextMenuPrimitive_GroupHeading) => {
			ContextMenuPrimitive_GroupHeading($$anchor, $.spread_props(
				{
					'data-slot': 'context-menu-group-heading',
					get 'data-inset'() {
						return $$props.inset;
					},

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
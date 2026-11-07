import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select as SelectPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

export default function Select_group_heading($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("px-2 py-1.5 text-xs text-muted-foreground", $$props.class));

		$.component(node, () => SelectPrimitive.GroupHeading, ($$anchor, SelectPrimitive_GroupHeading) => {
			SelectPrimitive_GroupHeading($$anchor, $.spread_props(
				{
					'data-slot': 'select-group-heading',
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
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						$.snippet(node_1, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
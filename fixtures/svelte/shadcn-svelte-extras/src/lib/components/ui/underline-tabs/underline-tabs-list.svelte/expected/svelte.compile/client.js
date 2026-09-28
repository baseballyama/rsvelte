import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs as TabsPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

export default function Underline_tabs_list($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('text-muted-foreground border-border relative inline-flex h-9 w-full max-w-full items-center justify-start overflow-x-auto border-b', $$props.class));

		$.component(node, () => TabsPrimitive.List, ($$anchor, TabsPrimitive_List) => {
			TabsPrimitive_List($$anchor, $.spread_props(
				{
					'data-slot': 'underline-tabs-list',
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
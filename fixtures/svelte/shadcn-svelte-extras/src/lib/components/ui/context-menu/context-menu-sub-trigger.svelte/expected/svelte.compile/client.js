import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'inset',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Context_menu_sub_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-inset:ps-8 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", $$props.class));

		$.component(node, () => ContextMenuPrimitive.SubTrigger, ($$anchor, ContextMenuPrimitive_SubTrigger) => {
			ContextMenuPrimitive_SubTrigger($$anchor, $.spread_props(
				{
					'data-slot': 'context-menu-sub-trigger',
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
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.snippet(node_1, () => $$props.children ?? $.noop);

						var node_2 = $.sibling(node_1, 2);

						ChevronRightIcon(node_2, { class: 'ml-auto' });
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
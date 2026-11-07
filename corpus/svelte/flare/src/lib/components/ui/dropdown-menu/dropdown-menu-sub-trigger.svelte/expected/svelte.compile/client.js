import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
import { cn } from '$lib/utils.js';

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

export default function Dropdown_menu_sub_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", $$props.class));

		$.component(node, () => DropdownMenuPrimitive.SubTrigger, ($$anchor, DropdownMenuPrimitive_SubTrigger) => {
			DropdownMenuPrimitive_SubTrigger($$anchor, $.spread_props(
				{
					'data-slot': 'dropdown-menu-sub-trigger',
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

						ChevronRightIcon(node_2, { class: 'ml-auto size-4' });
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
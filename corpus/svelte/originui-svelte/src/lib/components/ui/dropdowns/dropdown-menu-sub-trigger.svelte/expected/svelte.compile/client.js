import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'inset',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Dropdown_menu_sub_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('focus:bg-accent data-[state=open]:bg-accent flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0', $$props.inset && 'pl-8', $$props.class));

		$.component(node, () => DropdownMenuPrimitive.SubTrigger, ($$anchor, DropdownMenuPrimitive_SubTrigger) => {
			DropdownMenuPrimitive_SubTrigger($$anchor, $.spread_props(
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
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.snippet(node_1, () => $$props.children ?? $.noop);

						var node_2 = $.sibling(node_1, 2);

						ChevronRight(node_2, { class: 'text-muted-foreground/80 ml-auto' });
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
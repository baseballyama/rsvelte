import 'svelte/internal/disclose-version';
import { cn } from '$lib/utils';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

export const navigationMenuTriggerStyle = tv({
	base: 'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-hidden transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1'
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Navigation_menu_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn(navigationMenuTriggerStyle(), 'group', $$props.class));

		$.component(node, () => NavigationMenuPrimitive.Trigger, ($$anchor, NavigationMenuPrimitive_Trigger) => {
			NavigationMenuPrimitive_Trigger($$anchor, $.spread_props(
				{
					'data-slot': 'navigation-menu-trigger',
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

						ChevronDownIcon(node_2, {
							class: 'relative top-px ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180',
							'aria-hidden': 'true'
						});

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
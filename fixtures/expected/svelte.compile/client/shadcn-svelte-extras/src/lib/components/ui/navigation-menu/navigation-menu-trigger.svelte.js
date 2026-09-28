import 'svelte/internal/disclose-version';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

export const navigationMenuTriggerStyle = tv({
	base: 'hover:bg-muted focus:bg-muted data-open:hover:bg-muted data-open:focus:bg-muted data-open:bg-muted/50 focus-visible:ring-ring/50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-3 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50'
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
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
							class: 'relative top-px ml-1 size-3 transition duration-300 group-data-open/navigation-menu-trigger:rotate-180 group-data-popup-open/navigation-menu-trigger:rotate-180',
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
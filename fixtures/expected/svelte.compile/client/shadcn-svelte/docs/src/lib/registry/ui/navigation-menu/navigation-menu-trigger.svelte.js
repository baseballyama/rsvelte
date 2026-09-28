import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import { cn } from "$lib/utils.js";
import * as $ from 'svelte/internal/client';
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

export const navigationMenuTriggerStyle = tv({
	base: "cn-navigation-menu-trigger group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none"
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
		let $0 = $.derived(() => cn(navigationMenuTriggerStyle(), "group", $$props.class));

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

						IconPlaceholder(node_2, {
							lucide: 'ChevronDownIcon',
							tabler: 'IconChevronDown',
							hugeicons: 'ArrowDown01Icon',
							phosphor: 'CaretDownIcon',
							remixicon: 'RiArrowDownSLine',
							class: 'cn-navigation-menu-trigger-icon',
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
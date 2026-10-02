import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';
import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'ref']);

export default function Navigation_menu_link($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("hover:bg-accent focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 data-active:bg-accent data-active:text-accent-foreground data-active:hover:bg-accent data-active:focus:bg-accent [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm outline-hidden transition-all focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4", $$props.class));

		$.component(node, () => NavigationMenuPrimitive.Link, ($$anchor, NavigationMenuPrimitive_Link) => {
			NavigationMenuPrimitive_Link($$anchor, $.spread_props(
				{
					'data-slot': 'navigation-menu-link',
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
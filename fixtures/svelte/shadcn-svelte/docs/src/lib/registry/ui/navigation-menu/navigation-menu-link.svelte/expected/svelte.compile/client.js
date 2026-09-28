import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Navigation_menu_link($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-navigation-menu-link", $$props.class));

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
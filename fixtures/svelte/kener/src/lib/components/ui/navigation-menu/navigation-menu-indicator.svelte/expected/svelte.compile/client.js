import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<div class="bg-border rounded-ts-sm relative top-[60%] h-2 w-2 rotate-45 shadow-md"></div>`);

export default function Navigation_menu_indicator($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden", $$props.class));

		$.component(node, () => NavigationMenuPrimitive.Indicator, ($$anchor, NavigationMenuPrimitive_Indicator) => {
			NavigationMenuPrimitive_Indicator($$anchor, $.spread_props(
				{
					'data-slot': 'navigation-menu-indicator',
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
						var div = root();

						$.append($$anchor, div);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
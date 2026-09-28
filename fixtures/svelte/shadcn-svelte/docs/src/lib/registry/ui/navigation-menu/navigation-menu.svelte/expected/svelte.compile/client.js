import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import NavigationMenuViewport from "./navigation-menu-viewport.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'viewport',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Navigation_menu($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		viewport = $.prop($$props, 'viewport', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-navigation-menu group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", $$props.class));

		$.component(node, () => NavigationMenuPrimitive.Root, ($$anchor, NavigationMenuPrimitive_Root) => {
			NavigationMenuPrimitive_Root($$anchor, $.spread_props(
				{
					'data-slot': 'navigation-menu',
					get 'data-viewport'() {
						return viewport();
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

						{
							var consequent = ($$anchor) => {
								NavigationMenuViewport($$anchor, {});
							};

							$.if(node_2, ($$render) => {
								if (viewport()) $$render(consequent);
							});
						}

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
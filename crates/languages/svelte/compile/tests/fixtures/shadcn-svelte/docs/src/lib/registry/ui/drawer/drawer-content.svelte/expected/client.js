import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Drawer as DrawerPrimitive } from "vaul-svelte";
import { cn } from "$lib/utils.js";
import DrawerOverlay from "./drawer-overlay.svelte";
import DrawerPortal from "./drawer-portal.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'portalProps',
	'children'
]);

var root = $.from_html(`<div class="cn-drawer-handle mx-auto hidden shrink-0 bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Drawer_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	DrawerPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			DrawerOverlay(node, {});

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => cn("cn-drawer-content group/drawer-content fixed z-50", $$props.class));

				$.component(node_1, () => DrawerPrimitive.Content, ($$anchor, DrawerPrimitive_Content) => {
					DrawerPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'drawer-content',
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
								var fragment_2 = root();
								var node_2 = $.sibling($.first_child(fragment_2), 2);

								$.snippet(node_2, () => $$props.children ?? $.noop);
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}
					));
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));

	$.pop();
}
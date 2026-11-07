import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Drawer as DrawerPrimitive } from 'vaul-svelte';
import DrawerPortal from './drawer-portal.svelte';
import DrawerOverlay from './drawer-overlay.svelte';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'portalProps',
	'children'
]);

var root = $.from_html(`<div class="bg-muted bg-muted mx-auto mt-4 hidden h-1.5 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div> <!>`, 1);
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
				let $0 = $.derived(() => cn('bg-popover text-popover-foreground group/drawer-content fixed z-50 flex h-auto flex-col text-sm data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-r-xl data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-l-xl data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-xl data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm', $$props.class));

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
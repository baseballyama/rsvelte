import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import ContextMenuPortal from "./context-menu-portal.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'portalProps',
	'class'
]);

export default function Context_menu_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	ContextMenuPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cn("cn-context-menu-content cn-menu-target cn-menu-translucent z-50 overflow-x-hidden overflow-y-auto outline-none", $$props.class));

				$.component(node, () => ContextMenuPrimitive.Content, ($$anchor, ContextMenuPrimitive_Content) => {
					ContextMenuPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'context-menu-content',
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));

	$.pop();
}
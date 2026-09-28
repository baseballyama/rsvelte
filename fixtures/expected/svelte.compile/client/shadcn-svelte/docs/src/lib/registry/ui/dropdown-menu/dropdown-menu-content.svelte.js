import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import DropdownMenuPortal from "./dropdown-menu-portal.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'sideOffset',
	'align',
	'portalProps',
	'class'
]);

export default function Dropdown_menu_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		sideOffset = $.prop($$props, 'sideOffset', 3, 4),
		align = $.prop($$props, 'align', 3, "start"),
		restProps = $.rest_props($$props, rest_excludes);

	DropdownMenuPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cn("cn-dropdown-menu-content cn-dropdown-menu-content-logical cn-menu-target cn-menu-translucent z-50 w-(--bits-dropdown-menu-anchor-width) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden", $$props.class));

				$.component(node, () => DropdownMenuPrimitive.Content, ($$anchor, DropdownMenuPrimitive_Content) => {
					DropdownMenuPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'dropdown-menu-content',
							get sideOffset() {
								return sideOffset();
							},

							get align() {
								return align();
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
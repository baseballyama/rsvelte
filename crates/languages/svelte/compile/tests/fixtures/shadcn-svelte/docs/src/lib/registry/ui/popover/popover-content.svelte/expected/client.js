import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover as PopoverPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import PopoverPortal from "./popover-portal.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'sideOffset',
	'align',
	'portalProps'
]);

export default function Popover_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		sideOffset = $.prop($$props, 'sideOffset', 3, 4),
		align = $.prop($$props, 'align', 3, "center"),
		restProps = $.rest_props($$props, rest_excludes);

	PopoverPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cn("cn-popover-content cn-popover-content-logical z-50 w-72 origin-(--transform-origin) outline-hidden", $$props.class));

				$.component(node, () => PopoverPrimitive.Content, ($$anchor, PopoverPrimitive_Content) => {
					PopoverPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'popover-content',
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
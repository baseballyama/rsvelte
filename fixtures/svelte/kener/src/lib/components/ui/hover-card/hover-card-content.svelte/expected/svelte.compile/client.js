import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LinkPreview as HoverCardPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import HoverCardPortal from "./hover-card-portal.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'align',
	'sideOffset',
	'portalProps'
]);

export default function Hover_card_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		align = $.prop($$props, 'align', 3, "center"),
		sideOffset = $.prop($$props, 'sideOffset', 3, 4),
		restProps = $.rest_props($$props, rest_excludes);

	HoverCardPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-end-2 data-[side=right]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2 z-50 mt-3 w-64 rounded-md border p-4 shadow-md outline-hidden outline-none", $$props.class));

				$.component(node, () => HoverCardPrimitive.Content, ($$anchor, HoverCardPrimitive_Content) => {
					HoverCardPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'hover-card-content',
							get align() {
								return align();
							},

							get sideOffset() {
								return sideOffset();
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
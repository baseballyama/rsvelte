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
				let $0 = $.derived(() => cn("cn-hover-card-content z-50 origin-(--transform-origin) outline-hidden", $$props.class));

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
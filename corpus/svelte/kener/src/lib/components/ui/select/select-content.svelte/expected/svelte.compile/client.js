import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select as SelectPrimitive } from "bits-ui";
import SelectPortal from "./select-portal.svelte";
import SelectScrollUpButton from "./select-scroll-up-button.svelte";
import SelectScrollDownButton from "./select-scroll-down-button.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'sideOffset',
	'portalProps',
	'children',
	'preventScroll'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Select_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		sideOffset = $.prop($$props, 'sideOffset', 3, 4),
		preventScroll = $.prop($$props, 'preventScroll', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	SelectPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-end-2 data-[side=right]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--bits-select-content-available-height) min-w-[8rem] origin-(--bits-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", $$props.class));

				$.component(node, () => SelectPrimitive.Content, ($$anchor, SelectPrimitive_Content) => {
					SelectPrimitive_Content($$anchor, $.spread_props(
						{
							get sideOffset() {
								return sideOffset();
							},

							get preventScroll() {
								return preventScroll();
							},
							'data-slot': 'select-content',
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
								var node_1 = $.first_child(fragment_2);

								SelectScrollUpButton(node_1, {});

								var node_2 = $.sibling(node_1, 2);

								{
									let $0 = $.derived(() => cn("h-(--bits-select-anchor-height) w-full min-w-(--bits-select-anchor-width) scroll-my-1 p-1"));

									$.component(node_2, () => SelectPrimitive.Viewport, ($$anchor, SelectPrimitive_Viewport) => {
										SelectPrimitive_Viewport($$anchor, {
											get class() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_3 = $.comment();
												var node_3 = $.first_child(fragment_3);

												$.snippet(node_3, () => $$props.children ?? $.noop);
												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										});
									});
								}

								var node_4 = $.sibling(node_2, 2);

								SelectScrollDownButton(node_4, {});
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
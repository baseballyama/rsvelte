import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { Dialog as SheetPrimitive } from "bits-ui";
import XIcon from "@lucide/svelte/icons/x";
import SheetPortal from "./sheet-portal.svelte";
import SheetOverlay from "./sheet-overlay.svelte";
import { cn } from "$lib/utils.js";

export const sheetVariants = tv({
	base: "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
	variants: {
		side: {
			top: "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
			bottom: "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
			left: "inset-y-0 start-0 h-full w-3/4 border-e data-[state=closed]:slide-out-to-start data-[state=open]:slide-in-from-start sm:max-w-sm",
			right: "inset-y-0 end-0 h-full w-3/4 border-s data-[state=closed]:slide-out-to-end data-[state=open]:slide-in-from-end sm:max-w-sm"
		}
	},
	defaultVariants: { side: "right" }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'side',
	'portalProps',
	'children'
]);

var root = $.from_html(`<!> <span class="sr-only">Close</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Sheet_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		side = $.prop($$props, 'side', 3, "right"),
		restProps = $.rest_props($$props, rest_excludes);

	SheetPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			SheetOverlay(node, {});

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => cn(sheetVariants({ side: side() }), $$props.class));

				$.component(node_1, () => SheetPrimitive.Content, ($$anchor, SheetPrimitive_Content) => {
					SheetPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'sheet-content',
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
								var fragment_2 = root_1();
								var node_2 = $.first_child(fragment_2);

								$.snippet(node_2, () => $$props.children ?? $.noop);

								var node_3 = $.sibling(node_2, 2);

								$.component(node_3, () => SheetPrimitive.Close, ($$anchor, SheetPrimitive_Close) => {
									SheetPrimitive_Close($$anchor, {
										class: 'absolute end-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_4 = $.first_child(fragment_3);

											XIcon(node_4, { class: 'size-4' });
											$.next(2);
											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

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
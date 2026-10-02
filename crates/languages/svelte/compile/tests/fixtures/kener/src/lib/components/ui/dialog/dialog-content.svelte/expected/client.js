import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as DialogPrimitive } from "bits-ui";
import DialogPortal from "./dialog-portal.svelte";
import XIcon from "@lucide/svelte/icons/x";
import * as Dialog from "./index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'portalProps',
	'children',
	'showCloseButton'
]);

var root = $.from_html(`<!> <span class="sr-only">Close</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Dialog_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		showCloseButton = $.prop($$props, 'showCloseButton', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	DialogPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
				Dialog_Overlay($$anchor, {});
			});

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => cn("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg", $$props.class));

				$.component(node_1, () => DialogPrimitive.Content, ($$anchor, DialogPrimitive_Content) => {
					DialogPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'dialog-content',
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

								{
									var consequent = ($$anchor) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => DialogPrimitive.Close, ($$anchor, DialogPrimitive_Close) => {
											DialogPrimitive_Close($$anchor, {
												class: 'ring-offset-background focus:ring-ring absolute end-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_5 = $.first_child(fragment_4);

													XIcon(node_5, {});
													$.next(2);
													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									};

									$.if(node_3, ($$render) => {
										if (showCloseButton()) $$render(consequent);
									});
								}

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
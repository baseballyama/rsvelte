import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as SheetPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import SheetOverlay from "./sheet-overlay.svelte";
import SheetPortal from "./sheet-portal.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'side',
	'showCloseButton',
	'portalProps',
	'children'
]);

var root = $.from_html(`<!> <span class="sr-only">Close</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Sheet_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		side = $.prop($$props, 'side', 3, "right"),
		showCloseButton = $.prop($$props, 'showCloseButton', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	SheetPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			SheetOverlay(node, {});

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => cn("cn-sheet-content data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10", $$props.class));

				$.component(node_1, () => SheetPrimitive.Content, ($$anchor, SheetPrimitive_Content) => {
					SheetPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'sheet-content',
							get 'data-side'() {
								return side();
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

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props({ variant: 'ghost', class: 'cn-sheet-close', size: 'icon-sm' }, props, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root();
														var node_5 = $.first_child(fragment_5);

														IconPlaceholder(node_5, {
															lucide: 'XIcon',
															tabler: 'IconX',
															hugeicons: 'Cancel01Icon',
															phosphor: 'XIcon',
															remixicon: 'RiCloseLine'
														});

														$.next(2);
														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_4, () => SheetPrimitive.Close, ($$anchor, SheetPrimitive_Close) => {
												SheetPrimitive_Close($$anchor, { 'data-slot': 'sheet-close', child, $$slots: { child: true } });
											});
										}

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
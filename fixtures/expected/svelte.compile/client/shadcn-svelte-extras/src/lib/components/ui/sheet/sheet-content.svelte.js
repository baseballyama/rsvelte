import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as SheetPrimitive } from 'bits-ui';
import SheetPortal from './sheet-portal.svelte';
import SheetOverlay from './sheet-overlay.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import XIcon from '@lucide/svelte/icons/x';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'side',
	'showCloseButton',
	'portalProps',
	'children',
	'showOverlay'
]);

var root = $.from_html(`<!> <span class="sr-only">Close</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Sheet_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		side = $.prop($$props, 'side', 3, 'right'),
		showCloseButton = $.prop($$props, 'showCloseButton', 3, true),
		showOverlay = $.prop($$props, 'showOverlay', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	SheetPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					SheetOverlay($$anchor, {});
				};

				$.if(node, ($$render) => {
					if (showOverlay()) $$render(consequent);
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => cn('bg-popover text-popover-foreground data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10 fixed z-50 flex flex-col gap-4 bg-clip-padding text-sm shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm', $$props.class));

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
								var fragment_3 = root_1();
								var node_2 = $.first_child(fragment_3);

								$.snippet(node_2, () => $$props.children ?? $.noop);

								var node_3 = $.sibling(node_2, 2);

								{
									var consequent_1 = ($$anchor) => {
										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props(
													{
														variant: 'ghost',
														class: 'absolute top-4 right-4',
														size: 'icon-sm'
													},
													props,
													{
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root();
															var node_5 = $.first_child(fragment_6);

															XIcon(node_5, {});
															$.next(2);
															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													}
												));
											};

											$.component(node_4, () => SheetPrimitive.Close, ($$anchor, SheetPrimitive_Close) => {
												SheetPrimitive_Close($$anchor, { 'data-slot': 'sheet-close', child, $$slots: { child: true } });
											});
										}

										$.append($$anchor, fragment_4);
									};

									$.if(node_3, ($$render) => {
										if (showCloseButton()) $$render(consequent_1);
									});
								}

								$.append($$anchor, fragment_3);
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
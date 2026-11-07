import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as DialogPrimitive } from 'bits-ui';
import DialogPortal from './dialog-portal.svelte';
import * as Dialog from './index.js';
import { cn } from '$lib/utils.js';
import { Button } from '$lib/components/ui/button/index.js';
import XIcon from '@lucide/svelte/icons/x';

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
				let $0 = $.derived(() => cn('fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95', $$props.class));

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

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props(
													{
														variant: 'ghost',
														class: 'absolute top-2 right-2',
														size: 'icon-sm'
													},
													props,
													{
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_5 = $.first_child(fragment_5);

															XIcon(node_5, {});
															$.next(2);
															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													}
												));
											};

											$.component(node_4, () => DialogPrimitive.Close, ($$anchor, DialogPrimitive_Close) => {
												DialogPrimitive_Close($$anchor, { 'data-slot': 'dialog-close', child, $$slots: { child: true } });
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
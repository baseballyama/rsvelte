import * as $ from 'svelte/internal/server';
import { Dialog as DialogPrimitive } from 'bits-ui';
import DialogPortal from './dialog-portal.svelte';
import * as Dialog from './index.js';
import { cn } from '$lib/utils.js';
import { Button } from '$lib/components/ui/button/index.js';
import XIcon from '@lucide/svelte/icons/x';

export default function Dialog_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			portalProps,
			children,
			showCloseButton = true,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DialogPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						if (Dialog.Overlay) {
							$$renderer.push('<!--[-->');
							Dialog.Overlay($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (DialogPrimitive.Content) {
							$$renderer.push('<!--[-->');

							DialogPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'dialog-content',
									class: cn('fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95', className)
								},
								restProps,
								{
									get ref() {
										return ref;
									},

									set ref($$value) {
										ref = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										children?.($$renderer);
										$$renderer.push(`<!----> `);

										if (showCloseButton) {
											$$renderer.push('<!--[0-->');

											{
												function child($$renderer, { props }) {
													Button($$renderer, $.spread_props([
														{
															variant: 'ghost',
															class: 'absolute top-2 right-2',
															size: 'icon-sm'
														},
														props,
														{
															children: ($$renderer) => {
																XIcon($$renderer, {});
																$$renderer.push(`<!----> <span class="sr-only">Close</span>`);
															},
															$$slots: { default: true }
														}
													]));
												}

												if (DialogPrimitive.Close) {
													$$renderer.push('<!--[-->');
													DialogPrimitive.Close($$renderer, { 'data-slot': 'dialog-close', child, $$slots: { child: true } });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}
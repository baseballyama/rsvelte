import * as $ from 'svelte/internal/server';
import * as Drawer from '$lib/components/ui/drawer/index.js';
import Button from '$lib/components/ui/button/button.svelte';
import { ChevronRight, Copy, X } from '@lucide/svelte';
import Input from '$lib/components/ui/input/input.svelte';
import { CouponDrawerRenderer } from '$lib/core/composables/index.js';
import { format } from 'date-fns';
import { fly } from 'svelte/transition';
import { formatPrice } from '$lib/core/utils/index.js';
import { page } from '$app/state';
import { innerWidth } from 'svelte/reactivity/window';

export default function Coupons_drawer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, code = '', class: className = '' } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function content(
					$$renderer,
					{
						coupons,
						isChecking,
						handleCheck,
						handleCouponClick,
						handleCopy
					}
				) {
					if (Drawer.Root) {
						$$renderer.push('<!--[-->');

						Drawer.Root($$renderer, {
							open,
							direction: innerWidth.current && innerWidth.current > 400 ? 'right' : 'bottom',
							shouldScaleBackground: true,
							children: ($$renderer) => {
								if (Drawer.Trigger) {
									$$renderer.push('<!--[-->');

									Drawer.Trigger($$renderer, {
										class: `w-full ${className ? 'h-full' : ''}`,
										children: ($$renderer) => {
											Button($$renderer, {
												variant: 'outline',
												class: `group w-full justify-between !py-5 !px-6 ${$.stringify(className)}`,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Apply Promo Code <span class="text-muted-foreground">`);
													ChevronRight($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----></span>`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Drawer.Content) {
									$$renderer.push('<!--[-->');

									Drawer.Content($$renderer, {
										class: 'sm:left-auto sm:right-0 sm:top-0 sm:mt-0 sm:h-screen sm:w-fit sm:max-w-xl [&>div:first-child]:hidden',
										children: ($$renderer) => {
											$$renderer.push(`<div class="mx-auto w-full max-w-4xl pb-20 sm:pb-0">`);

											if (Drawer.Header) {
												$$renderer.push('<!--[-->');

												Drawer.Header($$renderer, {
													class: 'text-left',
													children: ($$renderer) => {
														if (Drawer.Title) {
															$$renderer.push('<!--[-->');

															Drawer.Title($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Apply Promo Code`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Drawer.Close) {
															$$renderer.push('<!--[-->');

															Drawer.Close($$renderer, {
																class: 'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
																children: ($$renderer) => {
																	X($$renderer, { class: 'h-4 w-4' });
																	$$renderer.push(`<!----> <span class="sr-only">Close</span>`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <div class="p-4 pb-0"><div class="flex gap-2">`);

											Input($$renderer, {
												placeholder: 'Enter your coupon code',
												class: 'flex-1',
												get value() {
													return code;
												},

												set value($$value) {
													code = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												onclick: handleCheck,
												disabled: !code || isChecking,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(isChecking ? 'Checking...' : 'APPLY')}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div></div> <div class="grid max-h-[80vh] grid-cols-1 gap-4 overflow-y-auto p-4 max-sm:max-h-[60vh]"><!--[-->`);

											const each_array = $.ensure_array_like(coupons || []);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let coupon = each_array[$$index];

												$$renderer.push(`<div class="relative rounded-lg border p-4 transition-colors hover:bg-muted/50"><button class="absolute right-4 top-4 text-muted-foreground hover:text-foreground">`);
												Copy($$renderer, { class: 'h-4 w-4' });
												$$renderer.push(`<!----> <span class="sr-only">Copy code</span></button> <button class="font-mono inline-block rounded border border-dashed border-primary px-3 py-1 text-sm text-black hover:border-gray-400">${$.escape(coupon.code)}</button> `);

												if (coupon?.description) {
													$$renderer.push(`<!--[0--><p class="mt-1 text-xs text-muted-foreground">${$.escape(coupon.description)}</p>`);
												} else {
													$$renderer.push(`<!--[-1--><p class="mt-2 text-sm">Order `);

													if (coupon?.minAmount) {
														$$renderer.push(`<!--[0-->above ${$.escape(formatPrice(coupon?.minAmount, page?.data?.store?.currency?.code))}`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> &amp; Get an Extra 
											${$.escape(!coupon.isPercent
														? `${formatPrice(coupon?.amount, page?.data?.store?.currency?.code)}`
														: `${coupon.amount}%`)} OFF on your entire
											purchase</p>`);
												}

												$$renderer.push(`<!--]--> <p class="mt-1 text-xs text-muted-foreground">Expires on : ${$.escape(format(coupon?.validTill || '', 'MMM dd, yyyy, hh:mm a'))}</p></div>`);
											}

											$$renderer.push(`<!--]--></div></div>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				CouponDrawerRenderer($$renderer, {
					get code() {
						return code;
					},

					set code($$value) {
						code = $$value;
						$$settled = false;
					},
					content,
					$$slots: { content: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { code });
	});
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`Apply Promo Code <span class="text-muted-foreground"><!></span>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Close</span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<p class="mt-1 text-xs text-muted-foreground"> </p>`);
var root_4 = $.from_html(`<p class="mt-2 text-sm">Order <!> </p>`);
var root_5 = $.from_html(`<div class="relative rounded-lg border p-4 transition-colors hover:bg-muted/50"><button class="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><!> <span class="sr-only">Copy code</span></button> <button class="font-mono inline-block rounded border border-dashed border-primary px-3 py-1 text-sm text-black hover:border-gray-400"> </button> <!> <p class="mt-1 text-xs text-muted-foreground"> </p></div>`);
var root_6 = $.from_html(`<div class="mx-auto w-full max-w-4xl pb-20 sm:pb-0"><!> <div class="p-4 pb-0"><div class="flex gap-2"><!> <!></div></div> <div class="grid max-h-[80vh] grid-cols-1 gap-4 overflow-y-auto p-4 max-sm:max-h-[60vh]"></div></div>`);

export default function Coupons_drawer($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 3, false),
		code = $.prop($$props, 'code', 15, ''),
		className = $.prop($$props, 'class', 3, '');

	{
		const content = ($$anchor, $$arg0) => {
			let coupons = () => ($$arg0?.()).coupons;
			let isChecking = () => ($$arg0?.()).isChecking;
			let handleCheck = () => ($$arg0?.()).handleCheck;
			let handleCouponClick = () => ($$arg0?.()).handleCouponClick;
			let handleCopy = () => ($$arg0?.()).handleCopy;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => innerWidth.current && innerWidth.current > 400 ? 'right' : 'bottom');

				$.component(node, () => Drawer.Root, ($$anchor, Drawer_Root) => {
					Drawer_Root($$anchor, {
						get open() {
							return open();
						},

						get direction() {
							return $.get($0);
						},
						shouldScaleBackground: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_1 = $.first_child(fragment_2);

							{
								let $0 = $.derived(() => className() ? 'h-full' : '');

								$.component(node_1, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
									Drawer_Trigger($$anchor, {
										get class() {
											return `w-full ${$.get($0) ?? ''}`;
										},

										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												variant: 'outline',
												get class() {
													return `group w-full justify-between !py-5 !px-6 ${className() ?? ''}`;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_4 = root();
													var span = $.sibling($.first_child(fragment_4));
													var node_2 = $.child(span);

													ChevronRight(node_2, { class: 'h-4 w-4' });
													$.reset(span);
													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								});
							}

							var node_3 = $.sibling(node_1, 2);

							$.component(node_3, () => Drawer.Content, ($$anchor, Drawer_Content) => {
								Drawer_Content($$anchor, {
									class: 'sm:left-auto sm:right-0 sm:top-0 sm:mt-0 sm:h-screen sm:w-fit sm:max-w-xl [&>div:first-child]:hidden',
									children: ($$anchor, $$slotProps) => {
										var div = root_6();
										var node_4 = $.child(div);

										$.component(node_4, () => Drawer.Header, ($$anchor, Drawer_Header) => {
											Drawer_Header($$anchor, {
												class: 'text-left',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_2();
													var node_5 = $.first_child(fragment_5);

													$.component(node_5, () => Drawer.Title, ($$anchor, Drawer_Title) => {
														Drawer_Title($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Apply Promo Code');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => Drawer.Close, ($$anchor, Drawer_Close) => {
														Drawer_Close($$anchor, {
															class: 'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root_1();
																var node_7 = $.first_child(fragment_6);

																X(node_7, { class: 'h-4 w-4' });
																$.next(2);
																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var div_1 = $.sibling(node_4, 2);
										var div_2 = $.child(div_1);
										var node_8 = $.child(div_2);

										Input(node_8, {
											placeholder: 'Enter your coupon code',
											class: 'flex-1',
											get value() {
												return code();
											},

											set value($$value) {
												code($$value);
											}
										});

										var node_9 = $.sibling(node_8, 2);

										{
											let $0 = $.derived(() => !code() || isChecking());

											Button(node_9, {
												get onclick() {
													return handleCheck();
												},

												get disabled() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, isChecking() ? 'Checking...' : 'APPLY'));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										}

										$.reset(div_2);
										$.reset(div_1);

										var div_3 = $.sibling(div_1, 2);

										$.each(div_3, 21, () => coupons() || [], $.index, ($$anchor, coupon) => {
											var div_4 = root_5();
											var button = $.child(div_4);
											var node_10 = $.child(button);

											Copy(node_10, { class: 'h-4 w-4' });
											$.next(2);
											$.reset(button);

											var button_1 = $.sibling(button, 2);
											var text_2 = $.only_child(button_1, true);
											var node_11 = $.sibling(button_1, 2);

											{
												var consequent = ($$anchor) => {
													var p = root_3();
													var text_3 = $.only_child(p, true);

													$.template_effect(() => $.set_text(text_3, $.get(coupon).description));
													$.append($$anchor, p);
												};

												var alternate = ($$anchor) => {
													var p_1 = root_4();
													var node_12 = $.sibling($.child(p_1));

													{
														var consequent_1 = ($$anchor) => {
															var text_4 = $.text();

															$.template_effect(($0) => $.set_text(text_4, `above ${$0 ?? ''}`), [
																() => formatPrice($.get(coupon)?.minAmount, page?.data?.store?.currency?.code)
															]);

															$.append($$anchor, text_4);
														};

														$.if(node_12, ($$render) => {
															if ($.get(coupon)?.minAmount) $$render(consequent_1);
														});
													}

													var text_5 = $.sibling(node_12);

													$.reset(p_1);

													$.template_effect(
														($0) => $.set_text(text_5, ` & Get an Extra 
											${$0 ?? ''} OFF on your entire
											purchase`),
														[
															() => !$.get(coupon).isPercent
																? `${formatPrice($.get(coupon)?.amount, page?.data?.store?.currency?.code)}`
																: `${$.get(coupon).amount}%`
														]
													);

													$.append($$anchor, p_1);
												};

												$.if(node_11, ($$render) => {
													if ($.get(coupon)?.description) $$render(consequent); else $$render(alternate, -1);
												});
											}

											var p_2 = $.sibling(node_11, 2);
											var text_6 = $.only_child(p_2);

											$.reset(div_4);

											$.template_effect(
												($0) => {
													$.set_text(text_2, $.get(coupon).code);
													$.set_text(text_6, `Expires on : ${$0 ?? ''}`);
												},
												[
													() => format($.get(coupon)?.validTill || '', 'MMM dd, yyyy, hh:mm a')
												]
											);

											$.delegated('click', button, () => handleCopy()($.get(coupon).code));
											$.delegated('click', button_1, () => handleCouponClick()($.get(coupon).code));
											$.append($$anchor, div_4);
										});

										$.reset(div_3);
										$.reset(div);
										$.transition(1, div, () => fly, () => ({ duration: 300 }));
										$.append($$anchor, div);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		CouponDrawerRenderer($$anchor, {
			get code() {
				return code();
			},

			set code($$value) {
				code($$value);
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}

$.delegate(['click']);
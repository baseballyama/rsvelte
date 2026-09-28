import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getUserState } from '@misiki/kitcommerce-core/stores';

import {
	X,
	UserCircle,
	ShoppingBag,
	MapPin,
	Heart,
	ArrowRightCircleIcon
} from '@lucide/svelte';

import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { Button } from '$lib/components/ui/button';
import { page } from '$app/state';

var root = $.from_html(`<div class="h-5 w-5 overflow-hidden rounded-full"><!></div>`);
var root_1 = $.from_html(`<img alt="" class="h-full w-full rounded-full object-cover"/>`);
var root_2 = $.from_html(`<div class="ed-pd-ico flex h-8 w-8 items-center justify-center bg-gray-50 transition-colors group-hover:bg-white"><!></div> Profile Settings`, 1);
var root_3 = $.from_html(`<div class="ed-pd-ico flex h-8 w-8 items-center justify-center bg-gray-50"><!></div> Order History`, 1);
var root_4 = $.from_html(`<div class="ed-pd-ico flex h-8 w-8 items-center justify-center bg-gray-50"><!></div> My Addresses`, 1);
var root_5 = $.from_html(`<div class="flex h-8 w-8 items-center justify-center bg-gray-50"><!></div> My Wishlist`, 1);
var root_6 = $.from_html(`<a href="/my/wishlist" class="block w-full"><!></a>`);
var root_7 = $.from_html(`<a href="/my/profile" class="block w-full"><!></a> <a href="/my/orders" class="block w-full"><!></a> <a href="/my/addresses" class="block w-full"><!></a> <!>`, 1);
var root_8 = $.from_html(`<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100/30"><!></div> Sign Out`, 1);
var root_9 = $.from_html(`<div class="ed-pd-head mb-2 flex items-center gap-3 border-b border-gray-50 px-4 py-4"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary"><!></div> <div class="overflow-hidden"><p class="truncate text-sm font-black text-gray-900"> </p> <p class="truncate text-[10px] font-bold uppercase tracking-widest text-gray-400"> </p></div></div> <!> <div class="ed-pd-sep my-2 h-px bg-gray-50"></div> <!>`, 1);
var root_10 = $.from_html(`<!> <!>`, 1);

export default function Profile_dropdown($$anchor, $$props) {
	$.push($$props, true);

	const userState = getUserState();
	const wishlistPlugin = $.derived(() => page.data?.store?.plugins?.isWishlist);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_10();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
					DropdownMenu_Trigger($$anchor, {
						'aria-label': 'User Profile',
						class: 'ed-pd-trigger flex items-center justify-center rounded-full',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									var div = root();
									var node_3 = $.child(div);

									{
										let $0 = $.derived(() => userState.user?.avatar);
										let $1 = $.derived(() => userState.user?.firstName || userState.user?.name || 'User');

										LazyImg(node_3, {
											width: '20',
											height: '20',
											get src() {
												return $.get($0);
											},

											get alt() {
												return `${$.get($1) ?? ''}'s avatar`;
											},
											class: 'h-full w-full object-cover object-top'
										});
									}

									$.reset(div);
									$.append($$anchor, div);
								};

								var alternate = ($$anchor) => {
									UserCircle($$anchor, { class: 'h-5 w-5' });
								};

								$.if(node_2, ($$render) => {
									if (userState.user?.avatar) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						class: 'ed-pd-menu min-w-[240px] border-gray-100 bg-white p-2 shadow-2xl',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_9();
							var div_1 = $.first_child(fragment_4);
							var div_2 = $.child(div_1);
							var node_5 = $.child(div_2);

							{
								var consequent_1 = ($$anchor) => {
									var img = root_1();

									$.template_effect(() => $.set_attribute(img, 'src', userState.user.avatar));
									$.append($$anchor, img);
								};

								var alternate_1 = ($$anchor) => {
									UserCircle($$anchor, { class: 'h-6 w-6' });
								};

								$.if(node_5, ($$render) => {
									if (userState.user?.avatar) $$render(consequent_1); else $$render(alternate_1, -1);
								});
							}

							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							var p = $.child(div_3);
							var text = $.only_child(p, true);
							var p_1 = $.sibling(p, 2);
							var text_1 = $.only_child(p_1, true);

							$.reset(div_3);
							$.reset(div_1);

							var node_6 = $.sibling(div_1, 2);

							$.component(node_6, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
								DropdownMenu_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_7();
										var a = $.first_child(fragment_6);
										var node_7 = $.child(a);

										$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
											DropdownMenu_Item($$anchor, {
												class: 'ed-pd-item flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-primary',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_2();
													var div_4 = $.first_child(fragment_7);
													var node_8 = $.child(div_4);

													UserCircle(node_8, { class: 'h-4 w-4' });
													$.reset(div_4);
													$.next();
													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										$.reset(a);

										var a_1 = $.sibling(a, 2);
										var node_9 = $.child(a_1);

										$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
											DropdownMenu_Item_1($$anchor, {
												class: 'ed-pd-item flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-primary',
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_3();
													var div_5 = $.first_child(fragment_8);
													var node_10 = $.child(div_5);

													ShoppingBag(node_10, { class: 'h-4 w-4' });
													$.reset(div_5);
													$.next();
													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										$.reset(a_1);

										var a_2 = $.sibling(a_1, 2);
										var node_11 = $.child(a_2);

										$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
											DropdownMenu_Item_2($$anchor, {
												class: 'ed-pd-item flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-primary',
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_4();
													var div_6 = $.first_child(fragment_9);
													var node_12 = $.child(div_6);

													MapPin(node_12, { class: 'h-4 w-4' });
													$.reset(div_6);
													$.next();
													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.reset(a_2);

										var node_13 = $.sibling(a_2, 2);

										{
											var consequent_2 = ($$anchor) => {
												var a_3 = root_6();
												var node_14 = $.child(a_3);

												$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
													DropdownMenu_Item_3($$anchor, {
														class: 'flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-primary',
														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root_5();
															var div_7 = $.first_child(fragment_10);
															var node_15 = $.child(div_7);

															Heart(node_15, { class: 'h-4 w-4' });
															$.reset(div_7);
															$.next();
															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												$.reset(a_3);
												$.append($$anchor, a_3);
											};

											$.if(node_13, ($$render) => {
												if ($.get(wishlistPlugin)?.active) $$render(consequent_2);
											});
										}

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var node_16 = $.sibling(node_6, 4);

							$.component(node_16, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
								DropdownMenu_Item_4($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'ghost',
											class: 'flex h-auto w-full items-center justify-start gap-3 px-3 py-2.5 text-red-500',
											get onclick() {
												return $$props.onSignOut;
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_12 = root_8();
												var div_8 = $.first_child(fragment_12);
												var node_17 = $.child(div_8);

												ArrowRightCircleIcon(node_17, { class: 'h-4 w-4' });
												$.reset(div_8);
												$.next();
												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.template_effect(() => {
								$.set_text(text, userState.user?.firstName || userState.user?.name || 'My Account');
								$.set_text(text_1, userState.user?.email || 'Logged In');
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
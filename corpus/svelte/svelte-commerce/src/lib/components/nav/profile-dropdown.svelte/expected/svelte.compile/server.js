import * as $ from 'svelte/internal/server';
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

export default function Profile_dropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const userState = getUserState();
		const { onSignOut } = $$props;
		const wishlistPlugin = $.derived(() => page.data?.store?.plugins?.isWishlist);

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					if (DropdownMenu.Trigger) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Trigger($$renderer, {
							'aria-label': 'User Profile',
							class: 'ed-pd-trigger flex items-center justify-center rounded-full',
							children: ($$renderer) => {
								if (userState.user?.avatar) {
									$$renderer.push(`<!--[0--><div class="h-5 w-5 overflow-hidden rounded-full">`);

									LazyImg($$renderer, {
										width: '20',
										height: '20',
										src: userState.user?.avatar,
										alt: `${$.stringify(userState.user?.firstName || userState.user?.name || 'User')}'s avatar`,
										class: 'h-full w-full object-cover object-top'
									});

									$$renderer.push(`<!----></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
									UserCircle($$renderer, { class: 'h-5 w-5' });
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (DropdownMenu.Content) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Content($$renderer, {
							class: 'ed-pd-menu min-w-[240px] border-gray-100 bg-white p-2 shadow-2xl',
							children: ($$renderer) => {
								$$renderer.push(`<div class="ed-pd-head mb-2 flex items-center gap-3 border-b border-gray-50 px-4 py-4"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">`);

								if (userState.user?.avatar) {
									$$renderer.push(`<!--[0--><img${$.attr('src', userState.user.avatar)} alt="" class="h-full w-full rounded-full object-cover"/>`);
								} else {
									$$renderer.push('<!--[-1-->');
									UserCircle($$renderer, { class: 'h-6 w-6' });
								}

								$$renderer.push(`<!--]--></div> <div class="overflow-hidden"><p class="truncate text-sm font-black text-gray-900">${$.escape(userState.user?.firstName || userState.user?.name || 'My Account')}</p> <p class="truncate text-[10px] font-bold uppercase tracking-widest text-gray-400">${$.escape(userState.user?.email || 'Logged In')}</p></div></div> `);

								if (DropdownMenu.Group) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Group($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<a href="/my/profile" class="block w-full">`);

											if (DropdownMenu.Item) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Item($$renderer, {
													class: 'ed-pd-item flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-primary',
													children: ($$renderer) => {
														$$renderer.push(`<div class="ed-pd-ico flex h-8 w-8 items-center justify-center bg-gray-50 transition-colors group-hover:bg-white">`);
														UserCircle($$renderer, { class: 'h-4 w-4' });
														$$renderer.push(`<!----></div> Profile Settings`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</a> <a href="/my/orders" class="block w-full">`);

											if (DropdownMenu.Item) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Item($$renderer, {
													class: 'ed-pd-item flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-primary',
													children: ($$renderer) => {
														$$renderer.push(`<div class="ed-pd-ico flex h-8 w-8 items-center justify-center bg-gray-50">`);
														ShoppingBag($$renderer, { class: 'h-4 w-4' });
														$$renderer.push(`<!----></div> Order History`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</a> <a href="/my/addresses" class="block w-full">`);

											if (DropdownMenu.Item) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Item($$renderer, {
													class: 'ed-pd-item flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-primary',
													children: ($$renderer) => {
														$$renderer.push(`<div class="ed-pd-ico flex h-8 w-8 items-center justify-center bg-gray-50">`);
														MapPin($$renderer, { class: 'h-4 w-4' });
														$$renderer.push(`<!----></div> My Addresses`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</a> `);

											if (wishlistPlugin()?.active) {
												$$renderer.push(`<!--[0--><a href="/my/wishlist" class="block w-full">`);

												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														class: 'flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-primary',
														children: ($$renderer) => {
															$$renderer.push(`<div class="flex h-8 w-8 items-center justify-center bg-gray-50">`);
															Heart($$renderer, { class: 'h-4 w-4' });
															$$renderer.push(`<!----></div> My Wishlist`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(`</a>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <div class="ed-pd-sep my-2 h-px bg-gray-50"></div> `);

								if (DropdownMenu.Item) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Item($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												variant: 'ghost',
												class: 'flex h-auto w-full items-center justify-start gap-3 px-3 py-2.5 text-red-500',
												onclick: onSignOut,
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100/30">`);
													ArrowRightCircleIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----></div> Sign Out`);
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
	});
}
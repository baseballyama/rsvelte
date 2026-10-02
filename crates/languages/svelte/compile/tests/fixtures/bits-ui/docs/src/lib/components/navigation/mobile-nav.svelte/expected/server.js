import * as $ from 'svelte/internal/server';
import MobileLink from "./mobile-link.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { navigation } from "$lib/config/index.js";
import { Popover } from "bits-ui";
import ScrollArea from "$lib/components/ui/scroll-area.svelte";
import { page } from "$app/state";
import MobileMenuIcon from "./mobile-menu-icon.svelte";

export default function Mobile_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'ghost',
										class: 'mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden [&_svg]:size-6',
										children: ($$renderer) => {
											MobileMenuIcon($$renderer, { open });
											$$renderer.push(`<!----> <span class="sr-only">Toggle menu</span>`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');
								Popover.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Popover.Portal) {
							$$renderer.push('<!--[-->');

							Popover.Portal($$renderer, {
								children: ($$renderer) => {
									if (Popover.Content) {
										$$renderer.push('<!--[-->');

										Popover.Content($$renderer, {
											class: 'bg-background/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 h-(--bits-popover-content-available-height) w-(--bits-popover-content-available-width) origin-(--bits-popover-content-transform-origin) z-50 pr-0 backdrop-blur',
											align: 'start',
											side: 'bottom',
											alignOffset: -16,
											sideOffset: 14,
											preventScroll: true,
											trapFocus: false,
											children: ($$renderer) => {
												ScrollArea($$renderer, {
													class: 'h-(--bits-popover-content-available-height) w-(--bits-popover-content-available-width) mt-2 max-h-none max-w-none',
													children: ($$renderer) => {
														$$renderer.push(`<div class="flex flex-col gap-2"><!--[-->`);

														const each_array = $.ensure_array_like(navigation.sidebar);

														for (let index = 0, $$length = each_array.length; index < $$length; index++) {
															let navItem = each_array[index];

															$$renderer.push(`<div class="flex flex-col pt-3"${$.attr('data-index', index)}><h4 class="text-muted-foreground mb-2 px-5 text-sm font-medium uppercase">${$.escape(navItem.title)}</h4> <div class="flex flex-col">`);

															if (navItem.title === "Overview") {
																$$renderer.push('<!--[0-->');

																MobileLink($$renderer, {
																	href: '/',
																	'data-active': page.url.pathname === "/",
																	onClose: () => open = false,
																	class: 'text-foreground/95 dark:data-[active=true]:text-accent px-5 py-1.5 text-[22px] font-normal data-[active=true]:font-semibold dark:font-medium dark:data-[active=true]:font-medium',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Home`);
																	},
																	$$slots: { default: true }
																});
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> `);

															if (navItem?.items?.length) {
																$$renderer.push(`<!--[0--><!--[-->`);

																const each_array_1 = $.ensure_array_like(navItem.items);

																for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																	let item = each_array_1[$$index];

																	if (!item.disabled && item.href) {
																		$$renderer.push('<!--[0-->');

																		MobileLink($$renderer, {
																			href: item.href,
																			'data-active': item.href === page.url.pathname,
																			onClose: () => open = false,
																			class: 'text-foreground/95 dark:data-[active=true]:text-accent px-5 py-1.5 text-[22px] font-normal data-[active=true]:font-semibold dark:font-medium dark:data-[active=true]:font-medium',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(item.title)}`);
																			},
																			$$slots: { default: true }
																		});
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]-->`);
																}

																$$renderer.push(`<!--]-->`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--></div></div>`);
														}

														$$renderer.push(`<!--]--></div>`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
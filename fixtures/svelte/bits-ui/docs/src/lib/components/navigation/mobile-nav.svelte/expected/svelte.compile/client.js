import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MobileLink from "./mobile-link.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { navigation } from "$lib/config/index.js";
import { Popover } from "bits-ui";
import ScrollArea from "$lib/components/ui/scroll-area.svelte";
import { page } from "$app/state";
import MobileMenuIcon from "./mobile-menu-icon.svelte";

var root = $.from_html(`<!> <span class="sr-only">Toggle menu</span>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col pt-3"><h4 class="text-muted-foreground mb-2 px-5 text-sm font-medium uppercase"> </h4> <div class="flex flex-col"><!> <!></div></div>`);
var root_2 = $.from_html(`<div class="flex flex-col gap-2"></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Mobile_nav($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'ghost',
							class: 'mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden [&_svg]:size-6',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								MobileMenuIcon(node_2, {
									get open() {
										return $.get(open);
									}
								});

								$.next(2);
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Popover.Portal, ($$anchor, Popover_Portal) => {
					Popover_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									class: 'bg-background/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 h-(--bits-popover-content-available-height) w-(--bits-popover-content-available-width) origin-(--bits-popover-content-transform-origin) z-50 pr-0 backdrop-blur',
									align: 'start',
									side: 'bottom',
									alignOffset: -16,
									sideOffset: 14,
									preventScroll: true,
									trapFocus: false,
									children: ($$anchor, $$slotProps) => {
										ScrollArea($$anchor, {
											class: 'h-(--bits-popover-content-available-height) w-(--bits-popover-content-available-width) mt-2 max-h-none max-w-none',
											children: ($$anchor, $$slotProps) => {
												var div = root_2();

												$.each(div, 21, () => navigation.sidebar, $.index, ($$anchor, navItem, index) => {
													var div_1 = root_1();

													$.set_attribute(div_1, 'data-index', index);

													var h4 = $.child(div_1);
													var text = $.only_child(h4, true);
													var div_2 = $.sibling(h4, 2);
													var node_5 = $.child(div_2);

													{
														var consequent = ($$anchor) => {
															{
																let $0 = $.derived(() => page.url.pathname === "/");

																MobileLink($$anchor, {
																	href: '/',
																	get 'data-active'() {
																		return $.get($0);
																	},
																	onClose: () => $.set(open, false),
																	class: 'text-foreground/95 dark:data-[active=true]:text-accent px-5 py-1.5 text-[22px] font-normal data-[active=true]:font-semibold dark:font-medium dark:data-[active=true]:font-medium',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('Home');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															}
														};

														$.if(node_5, ($$render) => {
															if ($.get(navItem).title === "Overview") $$render(consequent);
														});
													}

													var node_6 = $.sibling(node_5, 2);

													{
														var consequent_2 = ($$anchor) => {
															var fragment_7 = $.comment();
															var node_7 = $.first_child(fragment_7);

															$.each(node_7, 17, () => $.get(navItem).items, (item) => item.title + item.href, ($$anchor, item) => {
																var fragment_8 = $.comment();
																var node_8 = $.first_child(fragment_8);

																{
																	var consequent_1 = ($$anchor) => {
																		{
																			let $0 = $.derived(() => $.get(item).href === page.url.pathname);

																			MobileLink($$anchor, {
																				get href() {
																					return $.get(item).href;
																				},

																				get 'data-active'() {
																					return $.get($0);
																				},
																				onClose: () => $.set(open, false),
																				class: 'text-foreground/95 dark:data-[active=true]:text-accent px-5 py-1.5 text-[22px] font-normal data-[active=true]:font-semibold dark:font-medium dark:data-[active=true]:font-medium',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text();

																					$.template_effect(() => $.set_text(text_2, $.get(item).title));
																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});
																		}
																	};

																	$.if(node_8, ($$render) => {
																		if (!$.get(item).disabled && $.get(item).href) $$render(consequent_1);
																	});
																}

																$.append($$anchor, fragment_8);
															});

															$.append($$anchor, fragment_7);
														};

														$.if(node_6, ($$render) => {
															if ($.get(navItem)?.items?.length) $$render(consequent_2);
														});
													}

													$.reset(div_2);
													$.reset(div_1);
													$.template_effect(() => $.set_text(text, $.get(navItem).title));
													$.append($$anchor, div_1);
												});

												$.reset(div);
												$.append($$anchor, div);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
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
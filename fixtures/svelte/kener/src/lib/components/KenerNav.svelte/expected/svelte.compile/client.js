import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
import * as Dropdown from "$lib/components/ui/dropdown-menu/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import trackEvent from "$lib/beacon";
import MenuIcon from "@lucide/svelte/icons/menu";

var root = $.from_html(`<img class="mr-2 h-6 w-6 rounded-full object-cover"/>`);
var root_1 = $.from_html(`<img class="mr-2 h-4 w-4 object-cover"/>`);
var root_2 = $.from_html(`<a data-sveltekit-preload-data="off" style="border-radius: var(--radius-3xl)"><!> </a>`);
var root_3 = $.from_html(`<button><!></button>`);
var root_4 = $.from_html(`<!> `, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<div class="fixed inset-x-0 top-0 z-10 py-2"><div class="mx-auto max-w-5xl px-4"><div class="bg-background/80 dark:bg-background/70 flex items-center justify-between rounded-3xl border p-1 backdrop-blur-md"><a style="border-radius: var(--radius-3xl)"><!> </a> <!> <!></div></div></div>`);

export default function KenerNav($$anchor, $$props) {
	$.push($$props, true);

	let { data } = page;
	const navItems = data.navItems || [];
	const { siteName, logo, globalPageVisibilitySettings } = data;

	const brandPath = $.derived(() => {
		if (globalPageVisibilitySettings?.forceExclusivity) {
			const currentPagePath = page.params?.page_path?.trim();

			return currentPagePath ? `/${currentPagePath}` : "/";
		}

		return "/";
	});

	function trackBrandClick() {
		trackEvent("nav_brand_clicked", { name: siteName });
	}

	function trackNavClick(item) {
		trackEvent("nav_link_clicked", { name: item.name, external: item.url.startsWith("http") });
	}

	var div = root_6();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var a = $.child(div_2);
	var node = $.child(a);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(
				($0) => {
					$.set_attribute(img, 'src', $0);
					$.set_attribute(img, 'alt', siteName);
				},
				[() => clientResolver(resolve, logo)]
			);

			$.append($$anchor, img);
		};

		$.if(node, ($$render) => {
			if (logo) $$render(consequent);
		});
	}

	var text = $.sibling(node);

	$.reset(a);

	var node_1 = $.sibling(a, 2);

	$.component(node_1, () => NavigationMenu.Root, ($$anchor, NavigationMenu_Root) => {
		NavigationMenu_Root($$anchor, {
			class: 'hidden sm:block',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_2 = $.first_child(fragment);

				$.component(node_2, () => NavigationMenu.List, ($$anchor, NavigationMenu_List) => {
					NavigationMenu_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.each(node_3, 17, () => navItems, (item) => item.url, ($$anchor, item) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item) => {
									NavigationMenu_Item($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_5 = $.first_child(fragment_3);

											{
												const child = ($$anchor) => {
													var a_1 = root_2();
													var node_6 = $.child(a_1);

													{
														var consequent_1 = ($$anchor) => {
															var img_1 = root_1();

															$.template_effect(
																($0) => {
																	$.set_attribute(img_1, 'src', $0);
																	$.set_attribute(img_1, 'alt', $.get(item).name);
																},
																[() => clientResolver(resolve, $.get(item).iconURL)]
															);

															$.append($$anchor, img_1);
														};

														$.if(node_6, ($$render) => {
															if ($.get(item).iconURL) $$render(consequent_1);
														});
													}

													var text_1 = $.sibling(node_6);

													$.reset(a_1);

													$.template_effect(
														($0, $1, $2, $3) => {
															$.set_attribute(a_1, 'href', $0);
															$.set_class(a_1, 1, `${$1 ?? ''} hover:border-border border border-transparent bg-transparent text-xs hover:bg-transparent`);
															$.set_attribute(a_1, 'target', $2);
															$.set_attribute(a_1, 'rel', $3);
															$.set_text(text_1, ` ${$.get(item).name ?? ''}`);
														},
														[
															() => clientResolver(resolve, $.get(item).url),
															() => navigationMenuTriggerStyle(),
															() => $.get(item).url.startsWith("http") ? "_blank" : undefined,
															() => $.get(item).url.startsWith("http") ? "noopener noreferrer" : undefined
														]
													);

													$.delegated('click', a_1, () => trackNavClick($.get(item)));
													$.append($$anchor, a_1);
												};

												$.component(node_5, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link) => {
													NavigationMenu_Link($$anchor, { child, $$slots: { child: true } });
												});
											}

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_8 = $.first_child(fragment_4);

			$.component(node_8, () => Dropdown.Root, ($$anchor, Dropdown_Root) => {
				Dropdown_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_5();
						var node_9 = $.first_child(fragment_5);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var button = root_3();

								$.attribute_effect(
									button,
									($0) => ({
										...props(),
										type: 'button',
										class: `${$0 ?? ''} hover:border-border border border-transparent bg-transparent text-xs hover:bg-transparent sm:hidden`,
										style: 'border-radius: var(--radius-3xl)',
										'aria-label': 'Open navigation menu'
									}),
									[() => navigationMenuTriggerStyle()]
								);

								var node_10 = $.child(button);

								MenuIcon(node_10, { class: 'h-4 w-4' });
								$.reset(button);
								$.append($$anchor, button);
							};

							$.component(node_9, () => Dropdown.Trigger, ($$anchor, Dropdown_Trigger) => {
								Dropdown_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_11 = $.sibling(node_9, 2);

						$.component(node_11, () => Dropdown.Content, ($$anchor, Dropdown_Content) => {
							Dropdown_Content($$anchor, {
								align: 'end',
								class: 'w-56 rounded-3xl p-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_12 = $.first_child(fragment_6);

									$.each(node_12, 17, () => navItems, (item) => item.url, ($$anchor, item) => {
										{
											let $0 = $.derived(() => clientResolver(resolve, $.get(item).url));
											let $1 = $.derived(() => $.get(item).url.startsWith("http") ? "_blank" : undefined);
											let $2 = $.derived(() => $.get(item).url.startsWith("http") ? "noopener noreferrer" : undefined);

											Button($$anchor, {
												variant: 'ghost',
												size: 'sm',
												get href() {
													return $.get($0);
												},
												class: 'w-full justify-start rounded-full text-xs',
												get target() {
													return $.get($1);
												},

												get rel() {
													return $.get($2);
												},
												onclick: () => trackNavClick($.get(item)),
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_4();
													var node_13 = $.first_child(fragment_8);

													{
														var consequent_2 = ($$anchor) => {
															var img_2 = root_1();

															$.template_effect(
																($0) => {
																	$.set_attribute(img_2, 'src', $0);
																	$.set_attribute(img_2, 'alt', $.get(item).name);
																},
																[() => clientResolver(resolve, $.get(item).iconURL)]
															);

															$.append($$anchor, img_2);
														};

														$.if(node_13, ($$render) => {
															if ($.get(item).iconURL) $$render(consequent_2);
														});
													}

													var text_2 = $.sibling(node_13);

													$.template_effect(() => $.set_text(text_2, ` ${$.get(item).name ?? ''}`));
													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										}
									});

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

			$.append($$anchor, fragment_4);
		};

		$.if(node_7, ($$render) => {
			if (navItems.length > 0) $$render(consequent_3);
		});
	}

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(a, 'href', $0);
			$.set_class(a, 1, `${$1 ?? ''} hover:border-border border border-transparent bg-transparent text-xs hover:bg-transparent`);
			$.set_text(text, ` ${siteName ?? ''}`);
		},
		[
			() => clientResolver(resolve, $.get(brandPath)),
			() => navigationMenuTriggerStyle()
		]
	);

	$.delegated('click', a, trackBrandClick);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);
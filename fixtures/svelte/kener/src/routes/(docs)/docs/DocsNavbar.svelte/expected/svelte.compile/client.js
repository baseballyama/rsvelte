import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from "$app/navigation";
import Sun from "@lucide/svelte/icons/sun";
import Moon from "@lucide/svelte/icons/moon";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";
import Search from "@lucide/svelte/icons/search";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { toggleMode, mode } from "mode-watcher";
import DocsSearch from "./DocsSearch.svelte";
import { Button } from "$lib/components/ui/button";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground text-sm no-underline transition-colors duration-200"> </a>`);
var root_2 = $.from_html(`<div class="hidden items-center gap-3 lg:flex"></div>`);
var root_3 = $.from_html(`<div class="border-border/50 px-0"><div class="mx-auto flex h-10 items-center justify-between px-4"><nav class="flex min-w-0 items-center gap-2 overflow-x-auto"></nav> <a rel="external" class="text-muted-foreground hover:text-foreground ml-4 shrink-0 text-xs no-underline transition-colors duration-200">llms.txt</a></div></div>`);
var root_4 = $.from_html(`<header class="bg-background border-border/50 fixed top-0 right-0 left-0 z-50"><div class="mx-auto flex h-14 items-center justify-between px-6"><div class="flex items-center gap-4"><button class="text-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded border-none bg-transparent lg:hidden" aria-label="Toggle menu"><!></button> <a href="/docs" class="text-foreground flex items-center gap-2 no-underline"><img alt="" srcset="" class="h-8 dark:hidden"/> <img alt="" srcset="" class="hidden h-8 dark:block"/> <span class="text-base font-medium"> </span></a> <!></div> <button class="border-border bg-muted/50 text-muted-foreground hover:bg-muted hidden h-9 w-full max-w-sm cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors md:flex"><!> <span class="flex-1 text-left">Search documentation...</span> <kbd class="border-border bg-background text-muted-foreground pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none sm:flex"><span class="text-xs">⌘</span>K</kbd></button> <div class="flex items-center gap-4"><!> <button class="text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded border-none bg-transparent transition-all duration-200 md:hidden" aria-label="Search"><!></button> <button class="text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded border-none bg-transparent transition-all duration-200" aria-label="Toggle theme"><!></button></div></div> <!></header> <!>`, 1);

export default function DocsNavbar($$anchor, $$props) {
	$.push($$props, true);

	let isMobileMenuOpen = $.prop($$props, 'isMobileMenuOpen', 3, false);
	let searchOpen = $.state(false);

	function getDefaultTabKey() {
		const tabs = $$props.config.navigation?.tabs ?? [];

		return tabs.find((tab) => (tab.sidebar?.length ?? 0) > 0)?.key ?? tabs[0]?.key ?? null;
	}

	function getActiveTabKey() {
		return $$props.config.activeTabKey ?? getDefaultTabKey();
	}

	function getVersionHref(versionSlug) {
		const version = $$props.config.versions?.find((item) => item.slug === versionSlug);
		const firstPageSlug = version?.firstPageSlug;

		if (!firstPageSlug) {
			return `/docs/${versionSlug}`;
		}

		const normalizedFirstPageSlug = firstPageSlug.startsWith(`${versionSlug}/`)
			? firstPageSlug.slice(versionSlug.length + 1)
			: firstPageSlug;

		return `/docs/${versionSlug}/${normalizedFirstPageSlug}`;
	}

	function getActiveVersionLabel() {
		if (!$$props.config.versions || $$props.config.versions.length === 0) {
			return "Docs";
		}

		const activeVersion = $$props.config.versions.find((version) => version.slug === $$props.config.activeVersion);

		return activeVersion?.name ?? $$props.config.versions[0].name;
	}

	function isActiveVersion(versionSlug) {
		return $$props.config.activeVersion === versionSlug;
	}

	async function selectVersion(versionSlug) {
		await goto(getVersionHref(versionSlug));
	}

	function getTabHref(tab) {
		if (tab.url) {
			return tab.url;
		}

		const activeVersion = $$props.config.activeVersion;
		const firstPageSlug = tab.firstPageSlug;

		if (!activeVersion) {
			return "/docs";
		}

		if (!firstPageSlug) {
			return `/docs/${activeVersion}`;
		}

		const normalizedFirstPageSlug = firstPageSlug.startsWith(`${activeVersion}/`)
			? firstPageSlug.slice(activeVersion.length + 1)
			: firstPageSlug;

		return `/docs/${activeVersion}/${normalizedFirstPageSlug}`;
	}

	async function selectTab(tab) {
		if (tab.url) {
			window.location.href = tab.url;

			return;
		}

		await goto(getTabHref(tab));
	}

	function openSearch() {
		$.set(searchOpen, true);
	}

	function getLlmsHref() {
		const fallbackVersion = $$props.config.versions?.find((version) => version.latest)?.slug ?? $$props.config.versions?.[0]?.slug;
		const versionSlug = $$props.config.activeVersion ?? fallbackVersion;

		if (!versionSlug) {
			return "/docs";
		}

		return `/docs/${versionSlug}/llms.txt`;
	}

	var fragment = root_4();
	var header = $.first_child(fragment);
	var div = $.child(header);
	var div_1 = $.child(div);
	var button = $.child(div_1);
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			X($$anchor, { class: 'h-5 w-5' });
		};

		var alternate = ($$anchor) => {
			Menu($$anchor, { class: 'h-5 w-5' });
		};

		$.if(node, ($$render) => {
			if (isMobileMenuOpen()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var a = $.sibling(button, 2);
	var img = $.child(a);
	var img_1 = $.sibling(img, 2);
	var span = $.sibling(img_1, 2);
	var text = $.only_child(span, true);

	$.reset(a);

	var node_1 = $.sibling(a, 2);

	$.component(node_1, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_2 = $.first_child(fragment_3);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'link',
							class: 'text-muted-foreground h-8 px-0 text-xs ',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(($0) => $.set_text(text_1, $0), [() => getActiveVersionLabel()]);
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						class: 'w-56',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_4 = $.first_child(fragment_6);

							$.component(node_4, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
								DropdownMenu_Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Select Version');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
								DropdownMenu_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = $.comment();
										var node_6 = $.first_child(fragment_7);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_8 = $.comment();
												var node_7 = $.first_child(fragment_8);

												$.each(node_7, 17, () => $$props.config.versions, (version) => version.slug, ($$anchor, version) => {
													var fragment_9 = $.comment();
													var node_8 = $.first_child(fragment_9);

													{
														let $0 = $.derived(() => isActiveVersion($.get(version).slug) ? "active" : "");

														$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
															DropdownMenu_Item($$anchor, {
																onclick: () => selectVersion($.get(version).slug),
																get class() {
																	return $.get($0);
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text();

																	$.template_effect(() => $.set_text(text_3, $.get(version).name));
																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														});
													}

													$.append($$anchor, fragment_9);
												});

												$.append($$anchor, fragment_8);
											};

											var alternate_1 = ($$anchor) => {
												var fragment_11 = $.comment();
												var node_9 = $.first_child(fragment_11);

												$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
													DropdownMenu_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Default');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_11);
											};

											$.if(node_6, ($$render) => {
												if ($$props.config.versions && $$props.config.versions.length > 0) $$render(consequent_1); else $$render(alternate_1, -1);
											});
										}

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var button_1 = $.sibling(div_1, 2);
	var node_10 = $.child(button_1);

	Search(node_10, { class: 'h-4 w-4' });
	$.next(4);
	$.reset(button_1);

	var div_2 = $.sibling(button_1, 2);
	var node_11 = $.child(div_2);

	{
		var consequent_2 = ($$anchor) => {
			var div_3 = root_2();

			$.each(div_3, 21, () => $$props.config.footerLinks, (link) => link.url, ($$anchor, link) => {
				var a_1 = root_1();
				var text_5 = $.only_child(a_1, true);

				$.template_effect(() => {
					$.set_attribute(a_1, 'href', $.get(link).url);
					$.set_text(text_5, $.get(link).name);
				});

				$.append($$anchor, a_1);
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_11, ($$render) => {
			if ($$props.config.footerLinks) $$render(consequent_2);
		});
	}

	var button_2 = $.sibling(node_11, 2);
	var node_12 = $.child(button_2);

	Search(node_12, { class: 'h-5 w-5' });
	$.reset(button_2);

	var button_3 = $.sibling(button_2, 2);
	var node_13 = $.child(button_3);

	{
		var consequent_3 = ($$anchor) => {
			Sun($$anchor, { class: 'h-5 w-5' });
		};

		var alternate_2 = ($$anchor) => {
			Moon($$anchor, { class: 'h-5 w-5' });
		};

		$.if(node_13, ($$render) => {
			if (mode.current === "dark") $$render(consequent_3); else $$render(alternate_2, -1);
		});
	}

	$.reset(button_3);
	$.reset(div_2);
	$.reset(div);

	var node_14 = $.sibling(div, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_4 = root_3();
			var div_5 = $.child(div_4);
			var nav = $.child(div_5);

			$.each(nav, 23, () => $$props.config.navigation.tabs, (tab, index) => `${tab.name}-${index}`, ($$anchor, tab) => {
				{
					let $0 = $.derived(() => $.get(tab).key === getActiveTabKey() ? 'border-b-primary! border-b!' : '');

					Button($$anchor, {
						variant: 'ghost',
						size: 'sm',
						get class() {
							return `rounded-none  border-0 ${$.get($0) ?? ''}`;
						},
						onclick: () => selectTab($.get(tab)),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(tab).name));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				}
			});

			$.reset(nav);

			var a_2 = $.sibling(nav, 2);

			$.reset(div_5);
			$.reset(div_4);
			$.template_effect(($0) => $.set_attribute(a_2, 'href', $0), [() => getLlmsHref()]);
			$.append($$anchor, div_4);
		};

		$.if(node_14, ($$render) => {
			if ($$props.config.navigation?.tabs && $$props.config.navigation.tabs.length > 1) $$render(consequent_4);
		});
	}

	$.reset(header);

	var node_15 = $.sibling(header, 2);

	DocsSearch(node_15, {
		get open() {
			return $.get(searchOpen);
		},

		set open($$value) {
			$.set(searchOpen, $$value, true);
		}
	});

	$.template_effect(() => {
		$.set_attribute(img, 'src', $$props.config.logo?.light);
		$.set_attribute(img_1, 'src', $$props.config.logo?.dark);
		$.set_text(text, $$props.config.name);
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onMenuToggle?.apply(this, $$args);
	});

	$.delegated('click', button_1, openSearch);
	$.delegated('click', button_2, openSearch);

	$.delegated('click', button_3, function (...$$args) {
		toggleMode?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
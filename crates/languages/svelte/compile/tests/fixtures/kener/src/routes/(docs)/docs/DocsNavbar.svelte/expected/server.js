import * as $ from 'svelte/internal/server';
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

export default function DocsNavbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { config, currentSlug, onMenuToggle, isMobileMenuOpen = false } = $$props;
		let searchOpen = false;

		function getDefaultTabKey() {
			const tabs = config.navigation?.tabs ?? [];

			return tabs.find((tab) => (tab.sidebar?.length ?? 0) > 0)?.key ?? tabs[0]?.key ?? null;
		}

		function getActiveTabKey() {
			return config.activeTabKey ?? getDefaultTabKey();
		}

		function getVersionHref(versionSlug) {
			const version = config.versions?.find((item) => item.slug === versionSlug);
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
			if (!config.versions || config.versions.length === 0) {
				return "Docs";
			}

			const activeVersion = config.versions.find((version) => version.slug === config.activeVersion);

			return activeVersion?.name ?? config.versions[0].name;
		}

		function isActiveVersion(versionSlug) {
			return config.activeVersion === versionSlug;
		}

		async function selectVersion(versionSlug) {
			await goto(getVersionHref(versionSlug));
		}

		function getTabHref(tab) {
			if (tab.url) {
				return tab.url;
			}

			const activeVersion = config.activeVersion;
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
			searchOpen = true;
		}

		function getLlmsHref() {
			const fallbackVersion = config.versions?.find((version) => version.latest)?.slug ?? config.versions?.[0]?.slug;
			const versionSlug = config.activeVersion ?? fallbackVersion;

			if (!versionSlug) {
				return "/docs";
			}

			return `/docs/${versionSlug}/llms.txt`;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<header class="bg-background border-border/50 fixed top-0 right-0 left-0 z-50"><div class="mx-auto flex h-14 items-center justify-between px-6"><div class="flex items-center gap-4"><button class="text-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded border-none bg-transparent lg:hidden" aria-label="Toggle menu">`);

			if (isMobileMenuOpen) {
				$$renderer.push('<!--[0-->');
				X($$renderer, { class: 'h-5 w-5' });
			} else {
				$$renderer.push('<!--[-1-->');
				Menu($$renderer, { class: 'h-5 w-5' });
			}

			$$renderer.push(`<!--]--></button> <a href="/docs" class="text-foreground flex items-center gap-2 no-underline"><img${$.attr('src', config.logo?.light)} alt="" srcset="" class="h-8 dark:hidden"/> <img${$.attr('src', config.logo?.dark)} alt="" srcset="" class="hidden h-8 dark:block"/> <span class="text-base font-medium">${$.escape(config.name)}</span></a> `);

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'link',
										class: 'text-muted-foreground h-8 px-0 text-xs ',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(getActiveVersionLabel())}`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');
								DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								class: 'w-56',
								align: 'start',
								children: ($$renderer) => {
									if (DropdownMenu.Label) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Select Version`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (DropdownMenu.Group) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (config.versions && config.versions.length > 0) {
													$$renderer.push(`<!--[0--><!--[-->`);

													const each_array = $.ensure_array_like(config.versions);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let version = each_array[$$index];

														if (DropdownMenu.Item) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Item($$renderer, {
																onclick: () => selectVersion(version.slug),
																class: isActiveVersion(version.slug) ? "active" : "",
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(version.name)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													$$renderer.push(`<!--]-->`);
												} else {
													$$renderer.push('<!--[-1-->');

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Default`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
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

			$$renderer.push(`</div> <button class="border-border bg-muted/50 text-muted-foreground hover:bg-muted hidden h-9 w-full max-w-sm cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors md:flex">`);
			Search($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!----> <span class="flex-1 text-left">Search documentation...</span> <kbd class="border-border bg-background text-muted-foreground pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none sm:flex"><span class="text-xs">⌘</span>K</kbd></button> <div class="flex items-center gap-4">`);

			if (config.footerLinks) {
				$$renderer.push(`<!--[0--><div class="hidden items-center gap-3 lg:flex"><!--[-->`);

				const each_array_1 = $.ensure_array_like(config.footerLinks);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let link = each_array_1[$$index_1];

					$$renderer.push(`<a${$.attr('href', link.url)} target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground text-sm no-underline transition-colors duration-200">${$.escape(link.name)}</a>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <button class="text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded border-none bg-transparent transition-all duration-200 md:hidden" aria-label="Search">`);
			Search($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----></button> <button class="text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded border-none bg-transparent transition-all duration-200" aria-label="Toggle theme">`);

			if (mode.current === "dark") {
				$$renderer.push('<!--[0-->');
				Sun($$renderer, { class: 'h-5 w-5' });
			} else {
				$$renderer.push('<!--[-1-->');
				Moon($$renderer, { class: 'h-5 w-5' });
			}

			$$renderer.push(`<!--]--></button></div></div> `);

			if (config.navigation?.tabs && config.navigation.tabs.length > 1) {
				$$renderer.push(`<!--[0--><div class="border-border/50 px-0"><div class="mx-auto flex h-10 items-center justify-between px-4"><nav class="flex min-w-0 items-center gap-2 overflow-x-auto"><!--[-->`);

				const each_array_2 = $.ensure_array_like(config.navigation.tabs);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let tab = each_array_2[index];

					Button($$renderer, {
						variant: 'ghost',
						size: 'sm',
						class: `rounded-none  border-0 ${tab.key === getActiveTabKey() ? 'border-b-primary! border-b!' : ''}`,
						onclick: () => selectTab(tab),
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(tab.name)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></nav> <a${$.attr('href', getLlmsHref())} rel="external" class="text-muted-foreground hover:text-foreground ml-4 shrink-0 text-xs no-underline transition-colors duration-200">llms.txt</a></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></header> `);

			DocsSearch($$renderer, {
				get open() {
					return searchOpen;
				},

				set open($$value) {
					searchOpen = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
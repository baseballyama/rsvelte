import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { onMount } from "svelte";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import { page } from "$app/state";

export default function PageSelector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let currentPath = $.derived(() => page.params.page_path);
		let pages = [];
		let pagesLoading = false;
		const defaultHomePage = $.derived(() => pages.find((p) => p.page_path == ""));
		const currentPage = $.derived(() => pages.find((p) => p.page_path === currentPath()) || defaultHomePage());

		async function fetchPages() {
			pagesLoading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/dashboard-apis/pages"));

				if (response.ok) {
					pages = await response.json();
				}
			} catch {
				// silently fail, pages dropdown will just not show
			} finally {
				pagesLoading = false;
			}
		}

		onMount(() => {
			fetchPages();
		});

		$$renderer.push(`<div class="flex shrink-0 items-center gap-2">`);

		if (pagesLoading) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'outline',
				size: 'sm',
				class: 'bg-background/80 dark:bg-background/70 border-foreground/10 flex items-center justify-center rounded-full border text-xs shadow-none backdrop-blur-md',
				disabled: true,
				children: ($$renderer) => {
					Spinner($$renderer, { class: 'h-4 w-4' });
				},
				$$slots: { default: true }
			});
		} else if (pages.length > 0) {
			$$renderer.push('<!--[1-->');

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'outline',
										size: 'sm',
										class: 'bg-background/80 dark:bg-background/70 border-foreground/10 flex items-center justify-center rounded-full border text-xs shadow-none backdrop-blur-md',
										children: ($$renderer) => {
											$$renderer.push(`<span class="hidden max-w-[16rem] truncate sm:inline">${$.escape(currentPage()?.page_title || "Home")}</span> <span class="sr-only sm:hidden">${$.escape(currentPage()?.page_title || "Home")}</span> `);
											ChevronDown($$renderer, { class: 'h-4 w-4' });
											$$renderer.push(`<!---->`);
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
								align: 'start',
								class: 'bg-background/30 supports-backdrop-filter:bg-background/20 flex flex-col gap-1 rounded-3xl border p-2 shadow-2xl backdrop-blur-2xl',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(pages);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let page = each_array[$$index];

										Button($$renderer, {
											variant: page.page_path === currentPath() ? "outline" : "ghost",
											size: 'sm',
											href: clientResolver(resolve, `/${page.page_path}`),
											class: 'w-full justify-start rounded-full text-xs shadow-none',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(page.page_title)}`);
											},
											$$slots: { default: true }
										});
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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
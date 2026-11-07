import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { onMount } from "svelte";
import { page } from "$app/state";
import * as Item from "$lib/components/ui/item/index.js";
import ChevronRight from "@lucide/svelte/icons/chevron-right";

export default function PageList($$renderer, $$props) {
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
					console.log(">>>>>>----  PageList:25 ", pages);
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
			$$renderer.push(`<!--[1--><div class="flex w-full flex-col gap-2"><!--[-->`);

			const each_array = $.ensure_array_like(pages);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let page = each_array[$$index];

				{
					function child($$renderer, { props }) {
						$$renderer.push(`<a${$.attributes({
							href: clientResolver(resolve, `/${page.page_path}`),
							...props
						})}>`);

						if (page.page_logo) {
							$$renderer.push('<!--[0-->');

							if (Item.Media) {
								$$renderer.push('<!--[-->');

								Item.Media($$renderer, {
									variant: 'image',
									children: ($$renderer) => {
										$$renderer.push(`<img${$.attr('src', page.page_logo)}${$.attr('alt', page.page_title)} width="32" height="32" class="size-8 rounded object-cover"/>`);
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

						$$renderer.push(`<!--]--> `);

						if (Item.Content) {
							$$renderer.push('<!--[-->');

							Item.Content($$renderer, {
								children: ($$renderer) => {
									if (Item.Title) {
										$$renderer.push('<!--[-->');

										Item.Title($$renderer, {
											class: 'line-clamp-1',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(page.page_title)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Item.Description) {
										$$renderer.push('<!--[-->');

										Item.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(page.page_header)}`);
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

						$$renderer.push(` `);

						if (Item.Actions) {
							$$renderer.push('<!--[-->');

							Item.Actions($$renderer, {
								children: ($$renderer) => {
									ChevronRight($$renderer, { class: 'size-4' });
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</a>`);
					}

					if (Item.Root) {
						$$renderer.push('<!--[-->');

						Item.Root($$renderer, {
							variant: 'outline',
							class: 'rounded-3xl',
							child,
							$$slots: { child: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
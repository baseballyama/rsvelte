import * as $ from 'svelte/internal/server';
import SidebarIcon from "@lucide/svelte/icons/sidebar";
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import SearchForm from "./search-form.svelte";

export default function Site_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const sidebar = Sidebar.useSidebar();

		$$renderer.push(`<header class="sticky top-0 z-50 flex w-full items-center border-b bg-background"><div class="flex h-(--header-height) w-full items-center gap-2 px-4">`);

		Button($$renderer, {
			class: 'size-8',
			variant: 'ghost',
			size: 'icon',
			onclick: sidebar.toggle,
			children: ($$renderer) => {
				SidebarIcon($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		Separator($$renderer, { orientation: 'vertical', class: 'me-2 h-4' });
		$$renderer.push(`<!----> `);

		if (Breadcrumb.Root) {
			$$renderer.push('<!--[-->');

			Breadcrumb.Root($$renderer, {
				class: 'hidden sm:block',
				children: ($$renderer) => {
					if (Breadcrumb.List) {
						$$renderer.push('<!--[-->');

						Breadcrumb.List($$renderer, {
							children: ($$renderer) => {
								if (Breadcrumb.Item) {
									$$renderer.push('<!--[-->');

									Breadcrumb.Item($$renderer, {
										children: ($$renderer) => {
											if (Breadcrumb.Link) {
												$$renderer.push('<!--[-->');

												Breadcrumb.Link($$renderer, {
													href: '##',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Build Your Application`);
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

								if (Breadcrumb.Separator) {
									$$renderer.push('<!--[-->');
									Breadcrumb.Separator($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Breadcrumb.Item) {
									$$renderer.push('<!--[-->');

									Breadcrumb.Item($$renderer, {
										children: ($$renderer) => {
											if (Breadcrumb.Page) {
												$$renderer.push('<!--[-->');

												Breadcrumb.Page($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Data Fetching`);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		SearchForm($$renderer, { class: 'w-full sm:ms-auto sm:w-auto' });
		$$renderer.push(`<!----></div></header>`);
	});
}
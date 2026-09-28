import * as $ from 'svelte/internal/server';
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import AppSidebar from "./components/app-sidebar.svelte";

export default function _page($$renderer) {
	if (Sidebar.Provider) {
		$$renderer.push('<!--[-->');

		Sidebar.Provider($$renderer, {
			children: ($$renderer) => {
				AppSidebar($$renderer, {});
				$$renderer.push(`<!----> `);

				if (Sidebar.Inset) {
					$$renderer.push('<!--[-->');

					Sidebar.Inset($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<header class="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">`);

							if (Sidebar.Trigger) {
								$$renderer.push('<!--[-->');
								Sidebar.Trigger($$renderer, { class: '-ms-1' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							Separator($$renderer, {
								orientation: 'vertical',
								class: 'me-2 data-[orientation=vertical]:h-4'
							});

							$$renderer.push(`<!----> `);

							if (Breadcrumb.Root) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Root($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.List) {
											$$renderer.push('<!--[-->');

											Breadcrumb.List($$renderer, {
												children: ($$renderer) => {
													if (Breadcrumb.Item) {
														$$renderer.push('<!--[-->');

														Breadcrumb.Item($$renderer, {
															children: ($$renderer) => {
																if (Breadcrumb.Page) {
																	$$renderer.push('<!--[-->');

																	Breadcrumb.Page($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->October 2024`);
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

							$$renderer.push(`</header> <div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-5"><!--[-->`);

							const each_array = $.ensure_array_like(Array.from({ length: 20 }));

							for (let index = 0, $$length = each_array.length; index < $$length; index++) {
								let _ = each_array[index];

								$$renderer.push(`<div class="aspect-square rounded-xl bg-muted/50"></div>`);
							}

							$$renderer.push(`<!--]--></div></div>`);
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
import * as $ from 'svelte/internal/server';
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import AppSidebar from "./components/app-sidebar.svelte";
import NavActions from "./components/nav-actions.svelte";

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
							$$renderer.push(`<header class="flex h-14 shrink-0 items-center gap-2"><div class="flex flex-1 items-center gap-2 px-3">`);

							if (Sidebar.Trigger) {
								$$renderer.push('<!--[-->');
								Sidebar.Trigger($$renderer, {});
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
																		class: 'line-clamp-1',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Project Management &amp; Task Tracking`);
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

							$$renderer.push(`</div> <div class="ms-auto px-3">`);
							NavActions($$renderer, {});
							$$renderer.push(`<!----></div></header> <div class="flex flex-1 flex-col gap-4 px-4 py-10"><div class="mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50"></div> <div class="mx-auto h-full w-full max-w-3xl rounded-xl bg-muted/50"></div></div>`);
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
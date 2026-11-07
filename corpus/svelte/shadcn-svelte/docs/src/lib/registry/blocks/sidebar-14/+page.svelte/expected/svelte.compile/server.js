import * as $ from 'svelte/internal/server';
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import AppSidebar from "./components/app-sidebar.svelte";

export default function _page($$renderer) {
	if (Sidebar.Provider) {
		$$renderer.push('<!--[-->');

		Sidebar.Provider($$renderer, {
			children: ($$renderer) => {
				if (Sidebar.Inset) {
					$$renderer.push('<!--[-->');

					Sidebar.Inset($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">`);

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
															class: 'hidden md:block',
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
														Breadcrumb.Separator($$renderer, { class: 'hidden md:block' });
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

							if (Sidebar.Trigger) {
								$$renderer.push('<!--[-->');
								Sidebar.Trigger($$renderer, { class: 'ms-auto -me-1 rotate-180' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</header> <div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div></div> <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);
				AppSidebar($$renderer, { side: 'right' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}
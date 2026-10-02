import * as $ from 'svelte/internal/server';
import { goto } from "$app/navigation";
import { onMount } from "svelte";
import * as Table from "$lib/components/ui/table/index.js";
import * as Avatar from "$lib/components/ui/avatar/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import Plus from "@lucide/svelte/icons/plus";
import SettingsIcon from "@lucide/svelte/icons/settings";
import * as Item from "$lib/components/ui/item/index.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let pages = [];
		let loading = true;
		let error = null;

		async function fetchPages() {
			loading = true;
			error = null;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getPages" })
				});

				const result = await response.json();

				if (result.error) {
					error = result.error;
				} else {
					pages = result;
				}
			} catch(e) {
				error = e instanceof Error ? e.message : "Failed to fetch pages";
			} finally {
				loading = false;
			}
		}

		onMount(() => {
			fetchPages();
		});

		$$renderer.push(`<div class="flex w-full flex-col gap-4 p-4"><div class="mb-4 flex justify-end">`);

		Button($$renderer, {
			class: 'cursor-pointer',
			onclick: () => goto(clientResolver(resolve, "/manage/app/pages/new")),
			children: ($$renderer) => {
				Plus($$renderer, { class: 'size-4' });
				$$renderer.push(`<!----> New Page`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="flex w-full flex-col gap-4 [--radius:1rem]">`);

			if (Item.Root) {
				$$renderer.push('<!--[-->');

				Item.Root($$renderer, {
					variant: 'muted',
					class: 'mx-auto',
					children: ($$renderer) => {
						if (Item.Media) {
							$$renderer.push('<!--[-->');

							Item.Media($$renderer, {
								children: ($$renderer) => {
									Spinner($$renderer, {});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Item.Content) {
							$$renderer.push('<!--[-->');

							Item.Content($$renderer, {
								children: ($$renderer) => {
									if (Item.Title) {
										$$renderer.push('<!--[-->');

										Item.Title($$renderer, {
											class: 'line-clamp-1',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Loading Pages....`);
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

			$$renderer.push(`</div>`);
		} else if (error) {
			$$renderer.push(`<!--[1--><div class="text-destructive py-8 text-center">${$.escape(error)}</div>`);
		} else if (pages.length === 0) {
			$$renderer.push(`<!--[2--><div class="text-muted-foreground py-8 text-center">No pages found. Create your first page to get started.</div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="ktable rounded-xl border">`);

			if (Table.Root) {
				$$renderer.push('<!--[-->');

				Table.Root($$renderer, {
					children: ($$renderer) => {
						if (Table.Header) {
							$$renderer.push('<!--[-->');

							Table.Header($$renderer, {
								children: ($$renderer) => {
									if (Table.Row) {
										$$renderer.push('<!--[-->');

										Table.Row($$renderer, {
											children: ($$renderer) => {
												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														class: 'w-[340px]',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Page`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														class: 'w-[220px]',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Path`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														class: 'w-[150px]',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Monitors`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Head) {
													$$renderer.push('<!--[-->');
													Table.Head($$renderer, { class: 'w-[120px] text-right' });
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

						if (Table.Body) {
							$$renderer.push('<!--[-->');

							Table.Body($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(pages);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let page = each_array[$$index];

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<div class="flex items-start gap-3">`);

																if (Avatar.Root) {
																	$$renderer.push('<!--[-->');

																	Avatar.Root($$renderer, {
																		class: 'size-8 rounded-sm',
																		children: ($$renderer) => {
																			if (page.page_logo) {
																				$$renderer.push('<!--[0-->');

																				if (Avatar.Image) {
																					$$renderer.push('<!--[-->');

																					Avatar.Image($$renderer, {
																						src: clientResolver(resolve, page.page_logo),
																						alt: page.page_title
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

																			if (Avatar.Fallback) {
																				$$renderer.push('<!--[-->');

																				Avatar.Fallback($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(page.page_title.charAt(0).toUpperCase())}`);
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

																$$renderer.push(` <div class="min-w-0"><div class="font-medium">${$.escape(page.page_title)}</div> <p class="text-muted-foreground line-clamp-2 text-xs">${$.escape(page.page_header)}</p></div></div>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																Button($$renderer, {
																	variant: 'link',
																	class: 'h-auto px-0',
																	href: clientResolver(resolve, `/${page.page_path}`),
																	target: '_blank',
																	rel: 'noopener noreferrer',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->/${$.escape(page.page_path)}`);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																if (page.monitors && page.monitors.length > 0) {
																	$$renderer.push('<!--[0-->');

																	Badge($$renderer, {
																		variant: 'secondary',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(page.monitors.length)} monitor${$.escape(page.monitors.length > 1 ? "s" : "")}`);
																		},
																		$$slots: { default: true }
																	});
																} else {
																	$$renderer.push('<!--[-1-->');

																	Badge($$renderer, {
																		variant: 'outline',
																		class: 'text-muted-foreground',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->No monitors`);
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

													$$renderer.push(` `);

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															class: 'text-right',
															children: ($$renderer) => {
																Button($$renderer, {
																	variant: 'ghost',
																	target: '_blank',
																	size: 'sm',
																	href: clientResolver(resolve, `/${page.page_path}`),
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->View`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);

																Button($$renderer, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: () => goto(clientResolver(resolve, `/manage/app/pages/${page.id}`)),
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Edit`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!---->`);
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

			$$renderer.push(`</div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
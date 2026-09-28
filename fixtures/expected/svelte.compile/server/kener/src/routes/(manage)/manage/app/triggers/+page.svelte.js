import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import PlusIcon from "@lucide/svelte/icons/plus";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import { toast } from "svelte-sonner";
import { onMount } from "svelte";
import SettingsIcon from "@lucide/svelte/icons/settings";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Types
		// State
		let loading = true;

		let triggers = [];
		let totalPages = 0;
		let totalCount = 0;
		let pageNo = 1;
		let statusFilter = "ACTIVE";
		const limit = 10;

		// Fetch triggers
		async function fetchData() {
			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getTriggers",
						data: { status: statusFilter === "ALL" ? undefined : statusFilter }
					})
				});

				const result = await response.json();

				if (!result.error) {
					triggers = result.map((t) => ({ ...t, testLoaders: "idle" }));
					totalCount = triggers.length;
					totalPages = Math.ceil(totalCount / limit);
				}
			} catch(error) {
				console.error("Error fetching triggers:", error);
				toast.error("Failed to load triggers");
			} finally {
				loading = false;
			}
		}

		function handleStatusChange(value) {
			if (value) {
				statusFilter = value;
				pageNo = 1;
				fetchData();
			}
		}

		function goToPage(page) {
			pageNo = page;
		}

		// Paginated triggers
		const paginatedTriggers = $.derived(() => triggers.slice((pageNo - 1) * limit, pageNo * limit));

		onMount(() => {
			fetchData();
		});

		$$renderer.push(`<div class="container mx-auto space-y-6 py-6"><div class="flex items-center justify-between"><div class="flex items-center gap-3">`);

		if (Select.Root) {
			$$renderer.push('<!--[-->');

			Select.Root($$renderer, {
				type: 'single',
				value: statusFilter,
				onValueChange: handleStatusChange,
				children: ($$renderer) => {
					if (Select.Trigger) {
						$$renderer.push('<!--[-->');

						Select.Trigger($$renderer, {
							class: 'w-36',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(statusFilter === "ALL" ? "All Status" : statusFilter)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Select.Content) {
						$$renderer.push('<!--[-->');

						Select.Content($$renderer, {
							children: ($$renderer) => {
								if (Select.Item) {
									$$renderer.push('<!--[-->');

									Select.Item($$renderer, {
										value: 'ALL',
										children: ($$renderer) => {
											$$renderer.push(`<!---->All Status`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Select.Item) {
									$$renderer.push('<!--[-->');

									Select.Item($$renderer, {
										value: 'ACTIVE',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Active`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Select.Item) {
									$$renderer.push('<!--[-->');

									Select.Item($$renderer, {
										value: 'INACTIVE',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Inactive`);
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

		if (loading) {
			$$renderer.push('<!--[0-->');
			Spinner($$renderer, { class: 'size-5' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		Button($$renderer, {
			href: clientResolver(resolve, "/manage/app/triggers/new"),
			children: ($$renderer) => {
				PlusIcon($$renderer, { class: 'size-4' });
				$$renderer.push(`<!----> New Trigger`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		if (paginatedTriggers().length === 0 && !loading) {
			$$renderer.push(`<!--[0--><div class="text-muted-foreground py-8 text-center">No triggers found</div>`);
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
														class: 'w-[280px]',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Name`);
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
														class: 'w-[140px]',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Type`);
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
														class: 'w-[140px]',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Status`);
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
													Table.Head($$renderer, { class: 'w-[160px] text-right' });
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

									const each_array = $.ensure_array_like(paginatedTriggers());

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let trigger = each_array[$$index];

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															class: 'font-medium',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(trigger.name)}`);
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
																Badge($$renderer, {
																	variant: 'outline',
																	class: 'capitalize',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(trigger.trigger_type)}`);
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
																Badge($$renderer, {
																	variant: trigger.trigger_status === "ACTIVE" ? "default" : "secondary",
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(trigger.trigger_status)}`);
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
															class: 'text-right',
															children: ($$renderer) => {
																Button($$renderer, {
																	variant: 'outline',
																	size: 'sm',
																	href: clientResolver(resolve, `/manage/app/triggers/${trigger.id}`),
																	children: ($$renderer) => {
																		SettingsIcon($$renderer, { class: 'mr-1 size-4' });
																		$$renderer.push(`<!----> Configure`);
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

		$$renderer.push(`<!--]--> `);

		if (totalCount > limit) {
			$$renderer.push('<!--[0-->');

			const startItem = (pageNo - 1) * limit + 1;
			const endItem = Math.min(pageNo * limit, totalCount);

			$$renderer.push(`<div class="flex items-center justify-between"><span class="text-muted-foreground text-sm">Showing ${$.escape(startItem)}-${$.escape(endItem)} of ${$.escape(totalCount)}</span> `);

			if (totalPages > 1) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-2">`);

				Button($$renderer, {
					variant: 'outline',
					size: 'icon',
					disabled: pageNo === 1,
					onclick: () => goToPage(pageNo - 1),
					children: ($$renderer) => {
						ChevronLeftIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="flex items-center gap-1"><!--[-->`);

				const each_array_1 = $.ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let page = each_array_1[$$index_1];

					if (page === 1 || page === totalPages || page >= pageNo - 1 && page <= pageNo + 1) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							variant: page === pageNo ? "default" : "ghost",
							size: 'sm',
							onclick: () => goToPage(page),
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(page)}`);
							},
							$$slots: { default: true }
						});
					} else if (page === pageNo - 2 || page === pageNo + 2) {
						$$renderer.push(`<!--[1--><span class="text-muted-foreground px-1">...</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></div> `);

				Button($$renderer, {
					variant: 'outline',
					size: 'icon',
					disabled: pageNo === totalPages,
					onclick: () => goToPage(pageNo + 1),
					children: ($$renderer) => {
						ChevronRightIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
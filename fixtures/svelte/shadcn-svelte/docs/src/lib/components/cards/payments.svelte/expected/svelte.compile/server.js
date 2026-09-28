import * as $ from 'svelte/internal/server';

import {
	FlexRender,
	createColumnHelper,
	createTable,
	createTableState,
	renderComponent,
	renderSnippet
} from "@tanstack/svelte-table";

import { createRawSnippet } from "svelte";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import ActionsCell from "./payments-actions-cell.svelte";
import EmailHeader from "./payments-email-header.svelte";
import { features } from "./payments-features.js";

export default function Payments($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{
				id: "m5gr84i9",
				amount: 316,
				status: "success",
				email: "ken99@example.com"
			},

			{
				id: "3u1reuv4",
				amount: 242,
				status: "success",
				email: "Abe45@example.com"
			},

			{
				id: "derv1ws0",
				amount: 837,
				status: "processing",
				email: "Monserrat44@example.com"
			},

			{
				id: "bhqecj4p",
				amount: 721,
				status: "failed",
				email: "carmella@example.com"
			},

			{
				id: "k9f2m3n4",
				amount: 450,
				status: "pending",
				email: "jason78@example.com"
			},

			{
				id: "p5q6r7s8",
				amount: 1280,
				status: "success",
				email: "sarah23@example.com"
			}
		];

		const columnHelper = createColumnHelper();

		const columns = columnHelper.columns([
			columnHelper.display({
				id: "select",
				header: ({ table }) => renderComponent(Checkbox, {
					checked: table.getIsAllPageRowsSelected(),
					indeterminate: table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected(),
					onCheckedChange: (v) => table.toggleAllPageRowsSelected(!!v),
					"aria-label": "Select all"
				}),

				cell: ({ row }) => renderComponent(Checkbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (v) => row.toggleSelected(!!v)
				}),
				enableSorting: false,
				enableHiding: false
			}),

			columnHelper.accessor("status", {
				header: "Status",
				cell: ({ row }) => {
					const statusSnippet = createRawSnippet((getStatus) => {
						const { status } = getStatus();

						return { render: () => `<div class="capitalize">${status}</div>` };
					});

					return renderSnippet(statusSnippet, { status: row.original.status });
				}
			}),

			columnHelper.accessor("email", {
				header: ({ column }) => renderComponent(EmailHeader, { column }),
				cell: ({ row }) => {
					const emailSnippet = createRawSnippet((getEmail) => {
						const { email } = getEmail();

						return { render: () => `<div class="lowercase">${email}</div>` };
					});

					return renderSnippet(emailSnippet, { email: row.original.email });
				}
			}),

			columnHelper.accessor("amount", {
				header: () => renderSnippet(createRawSnippet(() => ({ render: () => `<div class="text-end">Amount</div>` }))),
				cell: ({ row }) => {
					const amountSnippet = createRawSnippet((getAmount) => {
						const { amount } = getAmount();
						const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

						return {
							render: () => `<div class="text-end font-medium">${formatted}</div>`
						};
					});

					return renderSnippet(amountSnippet, { amount: row.original.amount });
				}
			}),

			columnHelper.display({
				id: "actions",
				enableHiding: false,
				cell: ({ row }) => renderComponent(ActionsCell, { row })
			})
		]);

		// Keep row selection outside the table so the rest of the app can read or update it.
		const [rowSelection, setRowSelection] = createTableState({});

		// v9 manages the rest of its state internally — reads like
		// `table.getRowModel()` are rune-reactive, so no `$state` mirrors are needed.
		const table = createTable({
			features,
			get data() {
				return data;
			},
			columns,
			state: {
				get rowSelection() {
					return rowSelection();
				}
			},
			onRowSelectionChange: setRowSelection
		});

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										class: 'text-xl',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Payments`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Description) {
									$$renderer.push('<!--[-->');

									Card.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Manage your payments.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Action) {
									$$renderer.push('<!--[-->');

									Card.Action($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												variant: 'secondary',
												size: 'sm',
												class: 'shadow-none',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Add Payment`);
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

					$$renderer.push(` `);

					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'flex flex-col gap-4',
							children: ($$renderer) => {
								$$renderer.push(`<div class="rounded-md border">`);

								if (Table.Root) {
									$$renderer.push('<!--[-->');

									Table.Root($$renderer, {
										children: ($$renderer) => {
											if (Table.Header) {
												$$renderer.push('<!--[-->');

												Table.Header($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array = $.ensure_array_like(table.getHeaderGroups());

														for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
															let headerGroup = each_array[$$index_1];

															if (Table.Row) {
																$$renderer.push('<!--[-->');

																Table.Row($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array_1 = $.ensure_array_like(headerGroup.headers);

																		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																			let header = each_array_1[$$index];

																			if (Table.Head) {
																				$$renderer.push('<!--[-->');

																				Table.Head($$renderer, {
																					class: 'data-[name=actions]:w-10 data-[name=amount]:w-24 data-[name=select]:w-10 data-[name=status]:w-24 [&:has([role=checkbox])]:ps-3',
																					'data-name': header.id,
																					children: ($$renderer) => {
																						if (!header.isPlaceholder) {
																							$$renderer.push('<!--[0-->');
																							FlexRender($$renderer, { header });
																						} else {
																							$$renderer.push('<!--[-1-->');
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

											if (Table.Body) {
												$$renderer.push('<!--[-->');

												Table.Body($$renderer, {
													children: ($$renderer) => {
														if (table.getRowModel().rows?.length) {
															$$renderer.push(`<!--[0--><!--[-->`);

															const each_array_2 = $.ensure_array_like(table.getRowModel().rows);

															for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
																let row = each_array_2[$$index_3];

																if (Table.Row) {
																	$$renderer.push('<!--[-->');

																	Table.Row($$renderer, {
																		'data-state': row.getIsSelected() && "selected",
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_3 = $.ensure_array_like(row.getVisibleCells());

																			for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
																				let cell = each_array_3[$$index_2];

																				if (Table.Cell) {
																					$$renderer.push('<!--[-->');

																					Table.Cell($$renderer, {
																						class: 'data-[name=actions]:w-10 data-[name=amount]:w-24 data-[name=select]:w-10 data-[name=status]:w-24 [&:has([role=checkbox])]:ps-3',
																						'data-name': cell.column.id,
																						children: ($$renderer) => {
																							FlexRender($$renderer, { cell });
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
															}

															$$renderer.push(`<!--]-->`);
														} else {
															$$renderer.push('<!--[-1-->');

															if (Table.Row) {
																$$renderer.push('<!--[-->');

																Table.Row($$renderer, {
																	children: ($$renderer) => {
																		if (Table.Cell) {
																			$$renderer.push('<!--[-->');

																			Table.Cell($$renderer, {
																				colspan: columns.length,
																				class: 'h-24 text-center',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->No results.`);
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

								$$renderer.push(`</div> <div class="flex items-center justify-end gap-2"><div class="flex-1 text-sm text-muted-foreground">${$.escape(table.getFilteredSelectedRowModel().rows.length)} of
				${$.escape(table.getFilteredRowModel().rows.length)} row(s) selected.</div> <div class="flex gap-2">`);

								Button($$renderer, {
									variant: 'outline',
									size: 'sm',
									onclick: () => table.previousPage(),
									disabled: !table.getCanPreviousPage(),
									children: ($$renderer) => {
										$$renderer.push(`<!---->Previous`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									variant: 'outline',
									size: 'sm',
									onclick: () => table.nextPage(),
									disabled: !table.getCanNextPage(),
									children: ($$renderer) => {
										$$renderer.push(`<!---->Next`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div></div>`);
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
	});
}
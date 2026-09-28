import * as $ from 'svelte/internal/server';
import { SvelteSet } from "svelte/reactivity";
import * as Checkbox from "$lib/registry/ui/checkbox/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Checkbox_in_table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tableData = [
			{
				id: "1",
				name: "Sarah Chen",
				email: "sarah.chen@example.com",
				role: "Admin"
			},

			{
				id: "2",
				name: "Marcus Rodriguez",
				email: "marcus.rodriguez@example.com",
				role: "User"
			},

			{
				id: "3",
				name: "Priya Patel",
				email: "priya.patel@example.com",
				role: "User"
			},

			{
				id: "4",
				name: "David Kim",
				email: "david.kim@example.com",
				role: "Editor"
			}
		];

		let selectedRows = new SvelteSet(["1"]);
		const selectAll = $.derived(() => selectedRows.size === tableData.length);

		function handleSelectAll(checked) {
			if (checked === true) {
				for (const row of tableData) {
					selectedRows.add(row.id);
				}
			} else {
				selectedRows.clear();
			}
		}

		function handleSelectRow(id, checked) {
			if (checked === true) {
				selectedRows.add(id);
			} else {
				selectedRows.delete(id);
			}
		}

		Example($$renderer, {
			title: 'In Table',
			children: ($$renderer) => {
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
															class: 'w-8',
															children: ($$renderer) => {
																if (Checkbox.Root) {
																	$$renderer.push('<!--[-->');

																	Checkbox.Root($$renderer, {
																		id: 'select-all',
																		checked: selectAll(),
																		indeterminate: !selectAll() && selectedRows.size > 0,
																		onCheckedChange: handleSelectAll
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

													if (Table.Head) {
														$$renderer.push('<!--[-->');

														Table.Head($$renderer, {
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
															children: ($$renderer) => {
																$$renderer.push(`<!---->Email`);
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
															children: ($$renderer) => {
																$$renderer.push(`<!---->Role`);
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

							if (Table.Body) {
								$$renderer.push('<!--[-->');

								Table.Body($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(tableData);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let row = each_array[$$index];

											if (Table.Row) {
												$$renderer.push('<!--[-->');

												Table.Row($$renderer, {
													'data-state': selectedRows.has(row.id) ? "selected" : undefined,
													children: ($$renderer) => {
														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																children: ($$renderer) => {
																	if (Checkbox.Root) {
																		$$renderer.push('<!--[-->');

																		Checkbox.Root($$renderer, {
																			id: `row-${row.id}`,
																			checked: selectedRows.has(row.id),
																			onCheckedChange: (checked) => handleSelectRow(row.id, checked)
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

														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																class: 'font-medium',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(row.name)}`);
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
																	$$renderer.push(`<!---->${$.escape(row.email)}`);
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
																	$$renderer.push(`<!---->${$.escape(row.role)}`);
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
			},
			$$slots: { default: true }
		});
	});
}
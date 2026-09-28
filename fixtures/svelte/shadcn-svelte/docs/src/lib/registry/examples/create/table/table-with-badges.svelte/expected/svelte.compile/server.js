import * as $ from 'svelte/internal/server';
import * as Table from "$lib/registry/ui/table/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Table_with_badges($$renderer) {
	Example($$renderer, {
		title: 'With Badges',
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
														children: ($$renderer) => {
															$$renderer.push(`<!---->Task`);
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

													Table.Head($$renderer, {
														class: 'text-right',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Priority`);
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
									if (Table.Row) {
										$$renderer.push('<!--[-->');

										Table.Row($$renderer, {
											children: ($$renderer) => {
												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														class: 'font-medium',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Design homepage`);
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
															$$renderer.push(`<span class="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">Completed</span>`);
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
															$$renderer.push(`<span class="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">High</span>`);
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

									if (Table.Row) {
										$$renderer.push('<!--[-->');

										Table.Row($$renderer, {
											children: ($$renderer) => {
												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														class: 'font-medium',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Implement API`);
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
															$$renderer.push(`<span class="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">In Progress</span>`);
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
															$$renderer.push(`<span class="inline-flex items-center rounded-full bg-gray-500/10 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-400">Medium</span>`);
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

									if (Table.Row) {
										$$renderer.push('<!--[-->');

										Table.Row($$renderer, {
											children: ($$renderer) => {
												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														class: 'font-medium',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Write tests`);
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
															$$renderer.push(`<span class="inline-flex items-center rounded-full bg-gray-500/10 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-400">Pending</span>`);
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
															$$renderer.push(`<span class="inline-flex items-center rounded-full bg-gray-500/10 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-400">Low</span>`);
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
		},
		$$slots: { default: true }
	});
}
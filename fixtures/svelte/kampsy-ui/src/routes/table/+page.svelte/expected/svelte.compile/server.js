import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import { Table } from "$lib/index.js";
import { tableDefault, tableStriped, tableInteractive, tableFull } from "$lib/../docs/data/table.js";
import Pagination from "$lib/pagination/pagination.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function table($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">table</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">A semantic HTML table component</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCode($$renderer, demo, code) {
	$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4">`);
	demo($$renderer);
	$$renderer.push(`<!----></div></div> `);
	CollapseCode($$renderer, { code });
	$$renderer.push(`<!----></div>`);
}

function defaultTable($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);

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
																$$renderer.push(`<!---->Col 1`);
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
																$$renderer.push(`<!---->Col 2`);
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
																$$renderer.push(`<!---->Col 3`);
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
															children: ($$renderer) => {
																$$renderer.push(`<!---->Value 1.1`);
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
																$$renderer.push(`<!---->Value 1.2`);
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
																$$renderer.push(`<!---->Value 1.3`);
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
															children: ($$renderer) => {
																$$renderer.push(`<!---->Value 2.1`);
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
																$$renderer.push(`<!---->Value 2.2`);
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
																$$renderer.push(`<!---->Value 2.3`);
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
															children: ($$renderer) => {
																$$renderer.push(`<!---->Value 3.1`);
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
																$$renderer.push(`<!---->Value 3.2`);
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
																$$renderer.push(`<!---->Value 3.3`);
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

				$$renderer.push(`</div>`);
			}

			LinkH2($$renderer, {
				href: '/table#basic-table',
				'aria-label': 'basic-table',
				children: ($$renderer) => {
					$$renderer.push(`<!---->basic table`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, tableDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function striped($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);

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
																$$renderer.push(`<!---->Col 1`);
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
																$$renderer.push(`<!---->Col 2`);
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
																$$renderer.push(`<!---->Col 3`);
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
									striped: true,
									children: ($$renderer) => {
										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Value 1.1`);
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
																$$renderer.push(`<!---->Value 1.2`);
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
																$$renderer.push(`<!---->Value 1.3`);
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
															children: ($$renderer) => {
																$$renderer.push(`<!---->Value 2.1`);
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
																$$renderer.push(`<!---->Value 2.2`);
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
																$$renderer.push(`<!---->Value 2.3`);
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
															children: ($$renderer) => {
																$$renderer.push(`<!---->Value 3.1`);
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
																$$renderer.push(`<!---->Value 3.2`);
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
																$$renderer.push(`<!---->Value 3.3`);
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

				$$renderer.push(`</div>`);
			}

			LinkH2($$renderer, {
				href: '/table#striped-table',
				'aria-label': 'striped-table',
				children: ($$renderer) => {
					$$renderer.push(`<!---->striped table`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, tableStriped);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function interactive($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);

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
																$$renderer.push(`<!---->Col 1`);
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
																$$renderer.push(`<!---->Col 2`);
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
																$$renderer.push(`<!---->Col 3`);
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
									interactive: true,
									children: ($$renderer) => {
										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Value 1.1`);
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
																$$renderer.push(`<!---->Value 1.2`);
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
																$$renderer.push(`<!---->Value 1.3`);
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
															children: ($$renderer) => {
																$$renderer.push(`<!---->Value 2.1`);
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
																$$renderer.push(`<!---->Value 2.2`);
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
																$$renderer.push(`<!---->Value 2.3`);
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
															children: ($$renderer) => {
																$$renderer.push(`<!---->Value 3.1`);
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
																$$renderer.push(`<!---->Value 3.2`);
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
																$$renderer.push(`<!---->Value 3.3`);
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

				$$renderer.push(`</div>`);
			}

			LinkH2($$renderer, {
				href: '/table#interactive-table',
				'aria-label': 'interactive-table',
				children: ($$renderer) => {
					$$renderer.push(`<!---->interactive table`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, tableInteractive);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "switch", href: "/switch" },
				next: { title: "tabs", href: "/tabs" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const formatter = new Intl.NumberFormat("en-US", { style: "currency", maximumFractionDigits: 2, currency: "usd" });

		function formatCurrency(amount) {
			return formatter.format(amount);
		}

		const items = [
			{
				product: "Brake Pads Set",
				usage: "100 sets",
				price: "$50 per set",
				charge: 5000
			},

			{
				product: "Oil Filters",
				usage: "200 filters",
				price: "$10 per filter",
				charge: 2000
			},

			{
				product: "Car Batteries",
				usage: "50 batteries",
				price: "$100 per battery",
				charge: 5000
			},

			{
				product: "Headlight Bulbs",
				usage: "300 bulbs",
				price: "$15 per bulb",
				charge: 4500
			},

			{
				product: "Windshield Wipers",
				usage: "250 pairs",
				price: "$20 per pair",
				charge: 5000
			},

			{
				product: "Spark Plugs",
				usage: "500 sets",
				price: "$5 per set",
				charge: 2500
			}
		];

		function full($$renderer) {
			Row($$renderer, {
				children: ($$renderer) => {
					function demo($$renderer) {
						$$renderer.push(`<div class="w-full">`);

						if (Table.Root) {
							$$renderer.push('<!--[-->');

							Table.Root($$renderer, {
								children: ($$renderer) => {
									if (Table.Colgroup) {
										$$renderer.push('<!--[-->');

										Table.Colgroup($$renderer, {
											children: ($$renderer) => {
												if (Table.Col) {
													$$renderer.push('<!--[-->');
													Table.Col($$renderer, { class: 'w-[44%]' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Col) {
													$$renderer.push('<!--[-->');
													Table.Col($$renderer, { class: 'w-[22%]' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Col) {
													$$renderer.push('<!--[-->');
													Table.Col($$renderer, { class: 'w-[22%]' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Col) {
													$$renderer.push('<!--[-->');
													Table.Col($$renderer, { class: 'w-[11%]' });
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
																		$$renderer.push(`<!---->Product`);
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
																		$$renderer.push(`<!---->Usage`);
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
																		$$renderer.push(`<!---->Price`);
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
																		$$renderer.push(`<!---->Charge`);
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
											interactive: true,
											striped: true,
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(items);

												for (let index = 0, $$length = each_array.length; index < $$length; index++) {
													let item = each_array[index];

													if (Table.Row) {
														$$renderer.push('<!--[-->');

														Table.Row($$renderer, {
															children: ($$renderer) => {
																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(item.product)}`);
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
																			$$renderer.push(`<!---->${$.escape(item.usage)}`);
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
																			$$renderer.push(`<!---->${$.escape(item.price)}`);
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
																			$$renderer.push(`<!---->${$.escape(formatCurrency(item.charge))}`);
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

									$$renderer.push(` `);

									if (Table.Footer) {
										$$renderer.push('<!--[-->');

										Table.Footer($$renderer, {
											children: ($$renderer) => {
												if (Table.Row) {
													$$renderer.push('<!--[-->');

													Table.Row($$renderer, {
														children: ($$renderer) => {
															if (Table.Cell) {
																$$renderer.push('<!--[-->');

																Table.Cell($$renderer, {
																	class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 font-medium',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Subtotal`);
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
																Table.Cell($$renderer, {});
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Table.Cell) {
																$$renderer.push('<!--[-->');
																Table.Cell($$renderer, {});
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Table.Cell) {
																$$renderer.push('<!--[-->');

																Table.Cell($$renderer, {
																	class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 font-medium',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(formatCurrency(items.reduce((sum, val) => sum + val.charge, 0)))}`);
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

						$$renderer.push(`</div>`);
					}

					LinkH2($$renderer, {
						href: '/table#full-featured-table',
						'aria-label': 'full-featured-table',
						children: ($$renderer) => {
							$$renderer.push(`<!---->full featured table`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
					demoAndCode($$renderer, demo, tableFull);
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		}

		function cont($$renderer) {
			table($$renderer);
			$$renderer.push(`<!----> `);
			defaultTable($$renderer);
			$$renderer.push(`<!----> `);
			striped($$renderer);
			$$renderer.push(`<!----> `);
			interactive($$renderer);
			$$renderer.push(`<!----> `);
			full($$renderer);
			$$renderer.push(`<!----> `);
			prevAndNext($$renderer);
			$$renderer.push(`<!---->`);
		}

		$.head('zpsvtz', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Table</title>`);
			});
		});

		Shell($$renderer, { asideSlot: aside, contSlot: cont });
	});
}
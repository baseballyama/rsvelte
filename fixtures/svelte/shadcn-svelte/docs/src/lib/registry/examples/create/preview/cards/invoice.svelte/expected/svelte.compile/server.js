import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Invoice($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const INVOICE_ITEMS = [
			{ item: "Design System License", qty: 1, unitPrice: 499 },
			{ item: "Priority Support", qty: 12, unitPrice: 99 },
			{ item: "Custom Components", qty: 3, unitPrice: 250 }
		];

		const subtotal = INVOICE_ITEMS.reduce((sum, row) => sum + row.qty * row.unitPrice, 0);
		const tax = 0;
		const totalDue = subtotal + tax;

		function formatCurrency(value) {
			return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
		}

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
										children: ($$renderer) => {
											$$renderer.push(`<!---->Invoice #INV-2847`);
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
											$$renderer.push(`<!---->Due March 30, 2026`);
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
											Badge($$renderer, {
												variant: 'secondary',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Pending`);
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
																				$$renderer.push(`<!---->Item`);
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
																				$$renderer.push(`<!---->Qty`);
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
																				$$renderer.push(`<!---->Rate`);
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
																				$$renderer.push(`<!---->Amount`);
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

														const each_array = $.ensure_array_like(INVOICE_ITEMS);

														for (let index = 0, $$length = each_array.length; index < $$length; index++) {
															let row = each_array[index];

															if (Table.Row) {
																$$renderer.push('<!--[-->');

																Table.Row($$renderer, {
																	children: ($$renderer) => {
																		if (Table.Cell) {
																			$$renderer.push('<!--[-->');

																			Table.Cell($$renderer, {
																				class: 'text-sm',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(row.item)}`);
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
																				class: 'text-right tabular-nums',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(row.qty)}`);
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
																				class: 'text-right tabular-nums',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(formatCurrency(row.unitPrice))}`);
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
																				class: 'text-right tabular-nums',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(formatCurrency(row.qty * row.unitPrice))}`);
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

														$$renderer.push(`<!--]--> `);

														if (Table.Row) {
															$$renderer.push('<!--[-->');

															Table.Row($$renderer, {
																children: ($$renderer) => {
																	if (Table.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Cell($$renderer, {
																			colspan: 3,
																			class: 'text-right',
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

																		Table.Cell($$renderer, {
																			class: 'text-right tabular-nums',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(formatCurrency(subtotal))}`);
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
																			colspan: 3,
																			class: 'text-right',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Tax`);
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
																			class: 'text-right tabular-nums',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->$0.00`);
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
																			colspan: 3,
																			class: 'text-right',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Total Due`);
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
																			class: 'text-right tabular-nums',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(formatCurrency(totalDue))}`);
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

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Card.Footer) {
						$$renderer.push('<!--[-->');

						Card.Footer($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'outline',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Download PDF`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									size: 'sm',
									class: 'ml-auto',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Pay Now`);
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
	});
}
import * as $ from 'svelte/internal/server';
import { getLocalTimeZone, today } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";

export default function Upcoming_payments($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let date = today(getLocalTimeZone());
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
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
												$$renderer.push(`<!---->Upcoming Payments`);
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
												$$renderer.push(`<!---->Select a date to view scheduled payments.`);
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
									if (Item.Root) {
										$$renderer.push('<!--[-->');

										Item.Root($$renderer, {
											variant: 'outline',
											class: 'justify-center',
											children: ($$renderer) => {
												Calendar($$renderer, {
													type: 'single',
													class: 'w-full [--cell-size:--spacing(8)] md:[--cell-size:--spacing(10)]',
													get value() {
														return date;
													},

													set value($$value) {
														date = $$value;
														$$settled = false;
													}
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

									if (Item.Group) {
										$$renderer.push('<!--[-->');

										Item.Group($$renderer, {
											class: 'w-full',
											children: ($$renderer) => {
												if (Item.Root) {
													$$renderer.push('<!--[-->');

													Item.Root($$renderer, {
														variant: 'muted',
														children: ($$renderer) => {
															if (Item.Content) {
																$$renderer.push('<!--[-->');

																Item.Content($$renderer, {
																	children: ($$renderer) => {
																		if (Item.Title) {
																			$$renderer.push('<!--[-->');

																			Item.Title($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Netflix Subscription`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Item.Description) {
																			$$renderer.push('<!--[-->');

																			Item.Description($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Apr 15, 2024`);
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

															Badge($$renderer, {
																variant: 'secondary',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->$19.99`);
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

												$$renderer.push(` `);

												if (Item.Root) {
													$$renderer.push('<!--[-->');

													Item.Root($$renderer, {
														variant: 'muted',
														children: ($$renderer) => {
															if (Item.Content) {
																$$renderer.push('<!--[-->');

																Item.Content($$renderer, {
																	children: ($$renderer) => {
																		if (Item.Title) {
																			$$renderer.push('<!--[-->');

																			Item.Title($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Rent Payment`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Item.Description) {
																			$$renderer.push('<!--[-->');

																			Item.Description($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Apr 1, 2024`);
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

															Badge($$renderer, {
																variant: 'secondary',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->$2,400.00`);
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

												$$renderer.push(` `);

												if (Item.Root) {
													$$renderer.push('<!--[-->');

													Item.Root($$renderer, {
														variant: 'muted',
														children: ($$renderer) => {
															if (Item.Content) {
																$$renderer.push('<!--[-->');

																Item.Content($$renderer, {
																	children: ($$renderer) => {
																		if (Item.Title) {
																			$$renderer.push('<!--[-->');

																			Item.Title($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Auto Insurance`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Item.Description) {
																			$$renderer.push('<!--[-->');

																			Item.Description($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Apr 22, 2024`);
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

															Badge($$renderer, {
																variant: 'secondary',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->$186.00`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
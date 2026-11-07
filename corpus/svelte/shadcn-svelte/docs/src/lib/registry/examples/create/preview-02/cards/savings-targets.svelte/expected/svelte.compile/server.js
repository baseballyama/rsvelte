import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";

export default function Savings_targets($$renderer) {
	$$renderer.push(`<div class="grid grid-cols-2 gap-(--gap)">`);

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
										$$renderer.push(`<!---->Savings Targets`);
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
										$$renderer.push(`<!---->Active milestones for 2024`);
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
											variant: 'outline',
											size: 'sm',
											children: ($$renderer) => {
												$$renderer.push(`<!---->New Goal`);
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
							if (Item.Group) {
								$$renderer.push('<!--[-->');

								Item.Group($$renderer, {
									class: 'gap-3',
									children: ($$renderer) => {
										if (Item.Root) {
											$$renderer.push('<!--[-->');

											Item.Root($$renderer, {
												variant: 'muted',
												class: 'flex-col items-stretch',
												children: ($$renderer) => {
													if (Item.Content) {
														$$renderer.push('<!--[-->');

														Item.Content($$renderer, {
															class: 'gap-3',
															children: ($$renderer) => {
																if (Item.Description) {
																	$$renderer.push('<!--[-->');

																	Item.Description($$renderer, {
																		class: 'cn-font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Retirement`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` <span class="text-3xl font-semibold tabular-nums">$420,000</span> `);
																Progress($$renderer, { value: 65 });
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

													if (Item.Footer) {
														$$renderer.push('<!--[-->');

														Item.Footer($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<span class="text-sm text-muted-foreground">65% achieved</span> <span class="text-sm font-medium tabular-nums">$273,000</span>`);
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

										if (Item.Root) {
											$$renderer.push('<!--[-->');

											Item.Root($$renderer, {
												variant: 'muted',
												class: 'flex-col items-stretch',
												children: ($$renderer) => {
													if (Item.Content) {
														$$renderer.push('<!--[-->');

														Item.Content($$renderer, {
															class: 'gap-3',
															children: ($$renderer) => {
																if (Item.Description) {
																	$$renderer.push('<!--[-->');

																	Item.Description($$renderer, {
																		class: 'cn-font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Real Estate`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` <span class="text-3xl font-semibold tabular-nums">$85,000</span> `);
																Progress($$renderer, { value: 32 });
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

													if (Item.Footer) {
														$$renderer.push('<!--[-->');

														Item.Footer($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<span class="text-sm text-muted-foreground">32% achieved</span> <span class="text-sm font-medium tabular-nums">$27,200</span>`);
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
							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									class: 'text-center',
									children: ($$renderer) => {
										$$renderer.push(`<!---->You have not met your targets for this year.`);
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
										$$renderer.push(`<!---->Buy Investment`);
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
						class: 'flex flex-1 flex-col gap-3',
						children: ($$renderer) => {
							if (Field.Group) {
								$$renderer.push('<!--[-->');

								Field.Group($$renderer, {
									class: 'flex-1',
									children: ($$renderer) => {
										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												children: ($$renderer) => {
													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'invest-amount',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Amount to Invest`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (InputGroup.Root) {
														$$renderer.push('<!--[-->');

														InputGroup.Root($$renderer, {
															children: ($$renderer) => {
																if (InputGroup.Addon) {
																	$$renderer.push('<!--[-->');

																	InputGroup.Addon($$renderer, {
																		children: ($$renderer) => {
																			if (InputGroup.Text) {
																				$$renderer.push('<!--[-->');

																				InputGroup.Text($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->$`);
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

																if (InputGroup.Input) {
																	$$renderer.push('<!--[-->');
																	InputGroup.Input($$renderer, { id: 'invest-amount', value: '1,000.00' });
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

										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												children: ($$renderer) => {
													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'invest-type',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Order Type`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (NativeSelect.Root) {
														$$renderer.push('<!--[-->');

														NativeSelect.Root($$renderer, {
															id: 'invest-type',
															value: 'market',
															children: ($$renderer) => {
																if (NativeSelect.Option) {
																	$$renderer.push('<!--[-->');

																	NativeSelect.Option($$renderer, {
																		value: 'market',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Market Order`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (NativeSelect.Option) {
																	$$renderer.push('<!--[-->');

																	NativeSelect.Option($$renderer, {
																		value: 'limit',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Limit Order`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (NativeSelect.Option) {
																	$$renderer.push('<!--[-->');

																	NativeSelect.Option($$renderer, {
																		value: 'stop',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Stop Order`);
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

													if (Field.Description) {
														$$renderer.push('<!--[-->');

														Field.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Market orders execute at the current price.`);
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

										$$renderer.push(` <div class="flex flex-col gap-2"><div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Estimated Shares</span> <span class="text-sm font-semibold tabular-nums">1.95</span></div> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Buying Power</span> <span class="text-sm font-semibold tabular-nums">$12,450.00</span></div></div>`);
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
						class: 'flex-col gap-3',
						children: ($$renderer) => {
							Button($$renderer, {
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Review Order`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									class: 'text-center',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Trades are typically executed within minutes during market hours.`);
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
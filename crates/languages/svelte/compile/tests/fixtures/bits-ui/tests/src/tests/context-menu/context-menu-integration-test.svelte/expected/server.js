import * as $ from 'svelte/internal/server';

function contextMenu($$renderer, { id }) {
	if (ContextMenu.Root) {
		$$renderer.push('<!--[-->');

		ContextMenu.Root($$renderer, {
			children: ($$renderer) => {
				if (ContextMenu.Trigger) {
					$$renderer.push('<!--[-->');

					ContextMenu.Trigger($$renderer, {
						'data-testid': `context-trigger-${$.stringify(id)}`,
						class: 'z-[100] h-[500px] w-[500px]',
						'aria-expanded': undefined,
						'aria-controls': undefined,
						children: ($$renderer) => {
							$$renderer.push(`<!---->open`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (ContextMenu.Portal) {
					$$renderer.push('<!--[-->');

					ContextMenu.Portal($$renderer, {
						children: ($$renderer) => {
							if (ContextMenu.Content) {
								$$renderer.push('<!--[-->');

								ContextMenu.Content($$renderer, {
									'data-testid': `context-content-${$.stringify(id)}`,
									children: ($$renderer) => {
										if (ContextMenu.Item) {
											$$renderer.push('<!--[-->');

											ContextMenu.Item($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<span>item</span>`);
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

import { ContextMenu, Dialog, DropdownMenu, Popover, Select } from "bits-ui";

export default function Context_menu_integration_test($$renderer) {
	$$renderer.push(`<main class="flex flex-col gap-16">`);
	contextMenu($$renderer, { id: "1" });
	$$renderer.push(`<!----> `);

	if (DropdownMenu.Root) {
		$$renderer.push('<!--[-->');

		DropdownMenu.Root($$renderer, {
			children: ($$renderer) => {
				if (DropdownMenu.Trigger) {
					$$renderer.push('<!--[-->');

					DropdownMenu.Trigger($$renderer, {
						'data-testid': 'dropdown-trigger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->open`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (DropdownMenu.Portal) {
					$$renderer.push('<!--[-->');

					DropdownMenu.Portal($$renderer, {
						children: ($$renderer) => {
							if (DropdownMenu.Content) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Content($$renderer, {
									'data-testid': 'dropdown-content',
									children: ($$renderer) => {
										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Item($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Hello`);
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
	contextMenu($$renderer, { id: "2" });
	$$renderer.push(`<!----> `);

	if (Dialog.Root) {
		$$renderer.push('<!--[-->');

		Dialog.Root($$renderer, {
			children: ($$renderer) => {
				if (Dialog.Trigger) {
					$$renderer.push('<!--[-->');

					Dialog.Trigger($$renderer, {
						'data-testid': 'dialog-trigger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->open`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Dialog.Portal) {
					$$renderer.push('<!--[-->');

					Dialog.Portal($$renderer, {
						children: ($$renderer) => {
							if (Dialog.Content) {
								$$renderer.push('<!--[-->');

								Dialog.Content($$renderer, {
									'data-testid': 'dialog-content',
									class: 'z-[10]',
									children: ($$renderer) => {
										contextMenu($$renderer, { id: "3" });
										$$renderer.push(`<!----> `);

										if (Dialog.Close) {
											$$renderer.push('<!--[-->');

											Dialog.Close($$renderer, {
												'data-testid': 'dialog-close',
												children: ($$renderer) => {
													$$renderer.push(`<!---->close`);
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

	if (Popover.Root) {
		$$renderer.push('<!--[-->');

		Popover.Root($$renderer, {
			children: ($$renderer) => {
				if (Popover.Trigger) {
					$$renderer.push('<!--[-->');

					Popover.Trigger($$renderer, {
						'data-testid': 'popover-trigger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->open`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Popover.Portal) {
					$$renderer.push('<!--[-->');

					Popover.Portal($$renderer, {
						children: ($$renderer) => {
							if (Popover.Content) {
								$$renderer.push('<!--[-->');

								Popover.Content($$renderer, {
									'data-testid': 'popover-content',
									children: ($$renderer) => {
										contextMenu($$renderer, { id: "4" });
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

	if (ContextMenu.Root) {
		$$renderer.push('<!--[-->');

		ContextMenu.Root($$renderer, {
			children: ($$renderer) => {
				if (ContextMenu.Trigger) {
					$$renderer.push('<!--[-->');

					ContextMenu.Trigger($$renderer, {
						'data-testid': 'context-trigger-0',
						class: 'z-[100] h-[500px] w-[500px]',
						'aria-expanded': undefined,
						'aria-controls': undefined,
						children: ($$renderer) => {
							if (Popover.Root) {
								$$renderer.push('<!--[-->');

								Popover.Root($$renderer, {
									children: ($$renderer) => {
										if (Popover.Trigger) {
											$$renderer.push('<!--[-->');

											Popover.Trigger($$renderer, {
												'data-testid': 'popover-trigger-1',
												children: ($$renderer) => {
													$$renderer.push(`<!---->open`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Popover.Portal) {
											$$renderer.push('<!--[-->');

											Popover.Portal($$renderer, {
												children: ($$renderer) => {
													if (Popover.Content) {
														$$renderer.push('<!--[-->');

														Popover.Content($$renderer, {
															'data-testid': 'popover-content-1',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Hello`);
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

							if (Select.Root) {
								$$renderer.push('<!--[-->');

								Select.Root($$renderer, {
									type: 'single',
									children: ($$renderer) => {
										if (Select.Trigger) {
											$$renderer.push('<!--[-->');

											Select.Trigger($$renderer, {
												'data-testid': 'select-trigger-1',
												children: ($$renderer) => {
													$$renderer.push(`<!---->open`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Portal) {
											$$renderer.push('<!--[-->');

											Select.Portal($$renderer, {
												children: ($$renderer) => {
													if (Select.Content) {
														$$renderer.push('<!--[-->');

														Select.Content($$renderer, {
															'data-testid': 'select-content-1',
															children: ($$renderer) => {
																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: '1',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Hello`);
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

							if (Select.Root) {
								$$renderer.push('<!--[-->');

								Select.Root($$renderer, {
									type: 'single',
									children: ($$renderer) => {
										if (Select.Trigger) {
											$$renderer.push('<!--[-->');

											Select.Trigger($$renderer, {
												'data-testid': 'select-trigger-2',
												children: ($$renderer) => {
													$$renderer.push(`<!---->open`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Portal) {
											$$renderer.push('<!--[-->');

											Select.Portal($$renderer, {
												children: ($$renderer) => {
													if (Select.Content) {
														$$renderer.push('<!--[-->');

														Select.Content($$renderer, {
															'data-testid': 'select-content-2',
															children: ($$renderer) => {
																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: '1',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Hello`);
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

				if (ContextMenu.Portal) {
					$$renderer.push('<!--[-->');

					ContextMenu.Portal($$renderer, {
						children: ($$renderer) => {
							if (ContextMenu.Content) {
								$$renderer.push('<!--[-->');

								ContextMenu.Content($$renderer, {
									'data-testid': 'context-content-0',
									children: ($$renderer) => {
										if (ContextMenu.Item) {
											$$renderer.push('<!--[-->');

											ContextMenu.Item($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<span>item</span>`);
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

	$$renderer.push(`</main>`);
}
import * as $ from 'svelte/internal/server';
import * as Menubar from "$lib/registry/ui/menubar/index.js";

export default function Menubar_demo($$renderer) {
	let bookmarks = false;
	let fullUrls = true;
	let profileRadioValue = "benoit";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Menubar.Root) {
			$$renderer.push('<!--[-->');

			Menubar.Root($$renderer, {
				children: ($$renderer) => {
					if (Menubar.Menu) {
						$$renderer.push('<!--[-->');

						Menubar.Menu($$renderer, {
							children: ($$renderer) => {
								if (Menubar.Trigger) {
									$$renderer.push('<!--[-->');

									Menubar.Trigger($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->File`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Menubar.Content) {
									$$renderer.push('<!--[-->');

									Menubar.Content($$renderer, {
										children: ($$renderer) => {
											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->New Tab `);

														if (Menubar.Shortcut) {
															$$renderer.push('<!--[-->');

															Menubar.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->⌘T`);
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

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->New Window `);

														if (Menubar.Shortcut) {
															$$renderer.push('<!--[-->');

															Menubar.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->⌘N`);
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

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->New Incognito Window`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Separator) {
												$$renderer.push('<!--[-->');
												Menubar.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Sub) {
												$$renderer.push('<!--[-->');

												Menubar.Sub($$renderer, {
													children: ($$renderer) => {
														if (Menubar.SubTrigger) {
															$$renderer.push('<!--[-->');

															Menubar.SubTrigger($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Share`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Menubar.SubContent) {
															$$renderer.push('<!--[-->');

															Menubar.SubContent($$renderer, {
																children: ($$renderer) => {
																	if (Menubar.Item) {
																		$$renderer.push('<!--[-->');

																		Menubar.Item($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Email link`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Menubar.Item) {
																		$$renderer.push('<!--[-->');

																		Menubar.Item($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Messages`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Menubar.Item) {
																		$$renderer.push('<!--[-->');

																		Menubar.Item($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Notes`);
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

											if (Menubar.Separator) {
												$$renderer.push('<!--[-->');
												Menubar.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Print... `);

														if (Menubar.Shortcut) {
															$$renderer.push('<!--[-->');

															Menubar.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->⌘P`);
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

					if (Menubar.Menu) {
						$$renderer.push('<!--[-->');

						Menubar.Menu($$renderer, {
							children: ($$renderer) => {
								if (Menubar.Trigger) {
									$$renderer.push('<!--[-->');

									Menubar.Trigger($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Edit`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Menubar.Content) {
									$$renderer.push('<!--[-->');

									Menubar.Content($$renderer, {
										children: ($$renderer) => {
											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Undo `);

														if (Menubar.Shortcut) {
															$$renderer.push('<!--[-->');

															Menubar.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->⌘Z`);
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

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Redo `);

														if (Menubar.Shortcut) {
															$$renderer.push('<!--[-->');

															Menubar.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->⇧⌘Z`);
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

											if (Menubar.Separator) {
												$$renderer.push('<!--[-->');
												Menubar.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Sub) {
												$$renderer.push('<!--[-->');

												Menubar.Sub($$renderer, {
													children: ($$renderer) => {
														if (Menubar.SubTrigger) {
															$$renderer.push('<!--[-->');

															Menubar.SubTrigger($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Find`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Menubar.SubContent) {
															$$renderer.push('<!--[-->');

															Menubar.SubContent($$renderer, {
																children: ($$renderer) => {
																	if (Menubar.Item) {
																		$$renderer.push('<!--[-->');

																		Menubar.Item($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Search the web`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Menubar.Separator) {
																		$$renderer.push('<!--[-->');
																		Menubar.Separator($$renderer, {});
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Menubar.Item) {
																		$$renderer.push('<!--[-->');

																		Menubar.Item($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Find...`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Menubar.Item) {
																		$$renderer.push('<!--[-->');

																		Menubar.Item($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Find Next`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Menubar.Item) {
																		$$renderer.push('<!--[-->');

																		Menubar.Item($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Find Previous`);
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

											if (Menubar.Separator) {
												$$renderer.push('<!--[-->');
												Menubar.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cut`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Copy`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Paste`);
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

					if (Menubar.Menu) {
						$$renderer.push('<!--[-->');

						Menubar.Menu($$renderer, {
							children: ($$renderer) => {
								if (Menubar.Trigger) {
									$$renderer.push('<!--[-->');

									Menubar.Trigger($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->View`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Menubar.Content) {
									$$renderer.push('<!--[-->');

									Menubar.Content($$renderer, {
										children: ($$renderer) => {
											if (Menubar.CheckboxItem) {
												$$renderer.push('<!--[-->');

												Menubar.CheckboxItem($$renderer, {
													get checked() {
														return bookmarks;
													},

													set checked($$value) {
														bookmarks = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														$$renderer.push(`<!---->Always Show Bookmarks Bar`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.CheckboxItem) {
												$$renderer.push('<!--[-->');

												Menubar.CheckboxItem($$renderer, {
													get checked() {
														return fullUrls;
													},

													set checked($$value) {
														fullUrls = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														$$renderer.push(`<!---->Always Show Full URLs`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Separator) {
												$$renderer.push('<!--[-->');
												Menubar.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													inset: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Reload `);

														if (Menubar.Shortcut) {
															$$renderer.push('<!--[-->');

															Menubar.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->⌘R`);
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

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													inset: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Force Reload `);

														if (Menubar.Shortcut) {
															$$renderer.push('<!--[-->');

															Menubar.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->⇧⌘R`);
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

											if (Menubar.Separator) {
												$$renderer.push('<!--[-->');
												Menubar.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													inset: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Toggle Fullscreen`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Separator) {
												$$renderer.push('<!--[-->');
												Menubar.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													inset: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Hide Sidebar`);
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

					if (Menubar.Menu) {
						$$renderer.push('<!--[-->');

						Menubar.Menu($$renderer, {
							children: ($$renderer) => {
								if (Menubar.Trigger) {
									$$renderer.push('<!--[-->');

									Menubar.Trigger($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Profiles`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Menubar.Content) {
									$$renderer.push('<!--[-->');

									Menubar.Content($$renderer, {
										children: ($$renderer) => {
											if (Menubar.RadioGroup) {
												$$renderer.push('<!--[-->');

												Menubar.RadioGroup($$renderer, {
													get value() {
														return profileRadioValue;
													},

													set value($$value) {
														profileRadioValue = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Menubar.RadioItem) {
															$$renderer.push('<!--[-->');

															Menubar.RadioItem($$renderer, {
																value: 'andy',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Andy`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Menubar.RadioItem) {
															$$renderer.push('<!--[-->');

															Menubar.RadioItem($$renderer, {
																value: 'benoit',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Benoit`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Menubar.RadioItem) {
															$$renderer.push('<!--[-->');

															Menubar.RadioItem($$renderer, {
																value: 'Luis',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Luis`);
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

											if (Menubar.Separator) {
												$$renderer.push('<!--[-->');
												Menubar.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													inset: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Edit...`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Separator) {
												$$renderer.push('<!--[-->');
												Menubar.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													inset: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Add Profile...`);
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
}
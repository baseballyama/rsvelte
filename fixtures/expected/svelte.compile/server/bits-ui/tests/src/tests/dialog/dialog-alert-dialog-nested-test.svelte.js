import * as $ from 'svelte/internal/server';
import { Dialog, AlertDialog } from "bits-ui";

export default function Dialog_alert_dialog_nested_test($$renderer) {
	$$renderer.push(`<main>`);

	if (Dialog.Root) {
		$$renderer.push('<!--[-->');

		Dialog.Root($$renderer, {
			children: ($$renderer) => {
				if (Dialog.Trigger) {
					$$renderer.push('<!--[-->');

					Dialog.Trigger($$renderer, {
						'data-testid': 'dialog-open',
						children: ($$renderer) => {
							$$renderer.push(`<!---->dialog open`);
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
							if (Dialog.Overlay) {
								$$renderer.push('<!--[-->');
								Dialog.Overlay($$renderer, { 'data-testid': 'dialog-overlay' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Dialog.Content) {
								$$renderer.push('<!--[-->');

								Dialog.Content($$renderer, {
									'data-testid': 'dialog-content',
									children: ($$renderer) => {
										if (Dialog.Close) {
											$$renderer.push('<!--[-->');

											Dialog.Close($$renderer, {
												'data-testid': 'dialog-close',
												children: ($$renderer) => {
													$$renderer.push(`<!---->dialog close`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (AlertDialog.Root) {
											$$renderer.push('<!--[-->');

											AlertDialog.Root($$renderer, {
												children: ($$renderer) => {
													if (AlertDialog.Trigger) {
														$$renderer.push('<!--[-->');

														AlertDialog.Trigger($$renderer, {
															'data-testid': 'alert-open',
															children: ($$renderer) => {
																$$renderer.push(`<!---->alert open`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (AlertDialog.Portal) {
														$$renderer.push('<!--[-->');

														AlertDialog.Portal($$renderer, {
															children: ($$renderer) => {
																if (AlertDialog.Overlay) {
																	$$renderer.push('<!--[-->');
																	AlertDialog.Overlay($$renderer, { 'data-testid': 'alert-overlay' });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (AlertDialog.Content) {
																	$$renderer.push('<!--[-->');

																	AlertDialog.Content($$renderer, {
																		'data-testid': 'alert-content',
																		children: ($$renderer) => {
																			if (AlertDialog.Title) {
																				$$renderer.push('<!--[-->');

																				AlertDialog.Title($$renderer, {
																					'data-testid': 'alert-title',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Alert Title`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (AlertDialog.Description) {
																				$$renderer.push('<!--[-->');

																				AlertDialog.Description($$renderer, {
																					'data-testid': 'alert-description',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Alert Description`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (AlertDialog.Cancel) {
																				$$renderer.push('<!--[-->');

																				AlertDialog.Cancel($$renderer, {
																					'data-testid': 'alert-cancel',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->alert cancel`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (AlertDialog.Action) {
																				$$renderer.push('<!--[-->');

																				AlertDialog.Action($$renderer, {
																					'data-testid': 'alert-action',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->alert action`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Dialog.Root) {
																				$$renderer.push('<!--[-->');

																				Dialog.Root($$renderer, {
																					children: ($$renderer) => {
																						if (Dialog.Trigger) {
																							$$renderer.push('<!--[-->');

																							Dialog.Trigger($$renderer, {
																								'data-testid': 'nested-dialog-open',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->nested dialog open`);
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
																									if (Dialog.Overlay) {
																										$$renderer.push('<!--[-->');
																										Dialog.Overlay($$renderer, { 'data-testid': 'nested-dialog-overlay' });
																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (Dialog.Content) {
																										$$renderer.push('<!--[-->');

																										Dialog.Content($$renderer, {
																											'data-testid': 'nested-dialog-content',
																											children: ($$renderer) => {
																												if (Dialog.Close) {
																													$$renderer.push('<!--[-->');

																													Dialog.Close($$renderer, {
																														'data-testid': 'nested-dialog-close',
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->nested dialog close`);
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

	if (AlertDialog.Root) {
		$$renderer.push('<!--[-->');

		AlertDialog.Root($$renderer, {
			children: ($$renderer) => {
				if (AlertDialog.Trigger) {
					$$renderer.push('<!--[-->');

					AlertDialog.Trigger($$renderer, {
						'data-testid': 'alert-first-open',
						children: ($$renderer) => {
							$$renderer.push(`<!---->alert first open`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (AlertDialog.Portal) {
					$$renderer.push('<!--[-->');

					AlertDialog.Portal($$renderer, {
						children: ($$renderer) => {
							if (AlertDialog.Overlay) {
								$$renderer.push('<!--[-->');
								AlertDialog.Overlay($$renderer, { 'data-testid': 'alert-first-overlay' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (AlertDialog.Content) {
								$$renderer.push('<!--[-->');

								AlertDialog.Content($$renderer, {
									'data-testid': 'alert-first-content',
									children: ($$renderer) => {
										if (AlertDialog.Title) {
											$$renderer.push('<!--[-->');

											AlertDialog.Title($$renderer, {
												'data-testid': 'alert-first-title',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Alert First Title`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (AlertDialog.Description) {
											$$renderer.push('<!--[-->');

											AlertDialog.Description($$renderer, {
												'data-testid': 'alert-first-description',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Alert First Description`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (AlertDialog.Cancel) {
											$$renderer.push('<!--[-->');

											AlertDialog.Cancel($$renderer, {
												'data-testid': 'alert-first-cancel',
												children: ($$renderer) => {
													$$renderer.push(`<!---->alert first cancel`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (AlertDialog.Action) {
											$$renderer.push('<!--[-->');

											AlertDialog.Action($$renderer, {
												'data-testid': 'alert-first-action',
												children: ($$renderer) => {
													$$renderer.push(`<!---->alert first action`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Dialog.Root) {
											$$renderer.push('<!--[-->');

											Dialog.Root($$renderer, {
												children: ($$renderer) => {
													if (Dialog.Trigger) {
														$$renderer.push('<!--[-->');

														Dialog.Trigger($$renderer, {
															'data-testid': 'dialog-nested-open',
															children: ($$renderer) => {
																$$renderer.push(`<!---->dialog nested open`);
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
																if (Dialog.Overlay) {
																	$$renderer.push('<!--[-->');
																	Dialog.Overlay($$renderer, { 'data-testid': 'dialog-nested-overlay' });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Dialog.Content) {
																	$$renderer.push('<!--[-->');

																	Dialog.Content($$renderer, {
																		'data-testid': 'dialog-nested-content',
																		children: ($$renderer) => {
																			if (Dialog.Close) {
																				$$renderer.push('<!--[-->');

																				Dialog.Close($$renderer, {
																					'data-testid': 'dialog-nested-close',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->dialog nested close`);
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

	$$renderer.push(` <div id="portalTarget" data-testid="portalTarget"></div></main>`);
}
import * as $ from 'svelte/internal/server';
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Empty_avatar_group($$renderer) {
	Example($$renderer, {
		title: 'Empty',
		children: ($$renderer) => {
			if (Empty.Root) {
				$$renderer.push('<!--[-->');

				Empty.Root($$renderer, {
					class: 'h-full flex-none border',
					children: ($$renderer) => {
						if (Empty.Header) {
							$$renderer.push('<!--[-->');

							Empty.Header($$renderer, {
								children: ($$renderer) => {
									if (Empty.Media) {
										$$renderer.push('<!--[-->');

										Empty.Media($$renderer, {
											children: ($$renderer) => {
												if (Avatar.Group) {
													$$renderer.push('<!--[-->');

													Avatar.Group($$renderer, {
														class: 'grayscale',
														children: ($$renderer) => {
															if (Avatar.Root) {
																$$renderer.push('<!--[-->');

																Avatar.Root($$renderer, {
																	size: 'lg',
																	children: ($$renderer) => {
																		if (Avatar.Image) {
																			$$renderer.push('<!--[-->');
																			Avatar.Image($$renderer, { src: 'https://github.com/shadcn.png', alt: '@shadcn' });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Avatar.Fallback) {
																			$$renderer.push('<!--[-->');

																			Avatar.Fallback($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->CN`);
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

															if (Avatar.Root) {
																$$renderer.push('<!--[-->');

																Avatar.Root($$renderer, {
																	size: 'lg',
																	children: ($$renderer) => {
																		if (Avatar.Image) {
																			$$renderer.push('<!--[-->');
																			Avatar.Image($$renderer, { src: 'https://github.com/maxleiter.png', alt: '@maxleiter' });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Avatar.Fallback) {
																			$$renderer.push('<!--[-->');

																			Avatar.Fallback($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->LR`);
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

															if (Avatar.Root) {
																$$renderer.push('<!--[-->');

																Avatar.Root($$renderer, {
																	size: 'lg',
																	children: ($$renderer) => {
																		if (Avatar.Image) {
																			$$renderer.push('<!--[-->');
																			Avatar.Image($$renderer, { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit' });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Avatar.Fallback) {
																			$$renderer.push('<!--[-->');

																			Avatar.Fallback($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->ER`);
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

									if (Empty.Title) {
										$$renderer.push('<!--[-->');

										Empty.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->No Team Members`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Empty.Description) {
										$$renderer.push('<!--[-->');

										Empty.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Invite your team to collaborate on this project.`);
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

						if (Empty.Content) {
							$$renderer.push('<!--[-->');

							Empty.Content($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex gap-2">`);

									if (AlertDialog.Root) {
										$$renderer.push('<!--[-->');

										AlertDialog.Root($$renderer, {
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															{ variant: 'outline' },
															props,
															{
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Show Dialog`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (AlertDialog.Trigger) {
														$$renderer.push('<!--[-->');
														AlertDialog.Trigger($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												if (AlertDialog.Content) {
													$$renderer.push('<!--[-->');

													AlertDialog.Content($$renderer, {
														children: ($$renderer) => {
															if (AlertDialog.Header) {
																$$renderer.push('<!--[-->');

																AlertDialog.Header($$renderer, {
																	children: ($$renderer) => {
																		if (AlertDialog.Title) {
																			$$renderer.push('<!--[-->');

																			AlertDialog.Title($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Are you absolutely sure?`);
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
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->This action cannot be undone. This will permanently delete your account and remove
								your data from our servers.`);
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

															if (AlertDialog.Footer) {
																$$renderer.push('<!--[-->');

																AlertDialog.Footer($$renderer, {
																	children: ($$renderer) => {
																		if (AlertDialog.Cancel) {
																			$$renderer.push('<!--[-->');

																			AlertDialog.Cancel($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Cancel`);
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
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Continue`);
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
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															props,
															{
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Connect Mouse`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (AlertDialog.Trigger) {
														$$renderer.push('<!--[-->');
														AlertDialog.Trigger($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												if (AlertDialog.Content) {
													$$renderer.push('<!--[-->');

													AlertDialog.Content($$renderer, {
														size: 'sm',
														children: ($$renderer) => {
															if (AlertDialog.Header) {
																$$renderer.push('<!--[-->');

																AlertDialog.Header($$renderer, {
																	children: ($$renderer) => {
																		if (AlertDialog.Media) {
																			$$renderer.push('<!--[-->');

																			AlertDialog.Media($$renderer, {
																				children: ($$renderer) => {
																					IconPlaceholder($$renderer, {
																						lucide: 'BluetoothIcon',
																						tabler: 'IconBluetooth',
																						hugeicons: 'BluetoothIcon',
																						phosphor: 'BluetoothIcon',
																						remixicon: 'RiBluetoothLine'
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

																		if (AlertDialog.Title) {
																			$$renderer.push('<!--[-->');

																			AlertDialog.Title($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Allow accessory to connect?`);
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
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Do you want to allow the USB accessory to connect to this device?`);
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

															if (AlertDialog.Footer) {
																$$renderer.push('<!--[-->');

																AlertDialog.Footer($$renderer, {
																	children: ($$renderer) => {
																		if (AlertDialog.Cancel) {
																			$$renderer.push('<!--[-->');

																			AlertDialog.Cancel($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Don't allow`);
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
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Allow`);
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
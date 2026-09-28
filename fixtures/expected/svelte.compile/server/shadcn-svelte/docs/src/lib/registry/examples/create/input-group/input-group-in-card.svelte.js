import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_group_in_card($$renderer) {
	Example($$renderer, {
		title: 'In Card',
		children: ($$renderer) => {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'w-full',
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Card with Input Group`);
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
												$$renderer.push(`<!---->This is a card with an input group.`);
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
									if (Field.Group) {
										$$renderer.push('<!--[-->');

										Field.Group($$renderer, {
											children: ($$renderer) => {
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'email-input',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Email Address`);
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
																		if (InputGroup.Input) {
																			$$renderer.push('<!--[-->');

																			InputGroup.Input($$renderer, {
																				id: 'email-input',
																				type: 'email',
																				placeholder: 'you@example.com'
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (InputGroup.Addon) {
																			$$renderer.push('<!--[-->');

																			InputGroup.Addon($$renderer, {
																				align: 'inline-end',
																				children: ($$renderer) => {
																					IconPlaceholder($$renderer, {
																						lucide: 'MailIcon',
																						tabler: 'IconMail',
																						hugeicons: 'MailIcon',
																						phosphor: 'EnvelopeIcon',
																						remixicon: 'RiMailLine'
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
																	for: 'website-input',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Website URL`);
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
																								$$renderer.push(`<!---->https://`);
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
																			InputGroup.Input($$renderer, { id: 'website-input', placeholder: 'example.com' });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (InputGroup.Addon) {
																			$$renderer.push('<!--[-->');

																			InputGroup.Addon($$renderer, {
																				align: 'inline-end',
																				children: ($$renderer) => {
																					IconPlaceholder($$renderer, {
																						lucide: 'ExternalLinkIcon',
																						tabler: 'IconExternalLink',
																						hugeicons: 'LinkSquare02Icon',
																						phosphor: 'ArrowSquareOutIcon',
																						remixicon: 'RiExternalLinkLine'
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
																	for: 'feedback-textarea',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Feedback &amp; Comments`);
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
																		if (InputGroup.Textarea) {
																			$$renderer.push('<!--[-->');

																			InputGroup.Textarea($$renderer, {
																				id: 'feedback-textarea',
																				placeholder: 'Share your thoughts...',
																				class: 'min-h-[100px]'
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (InputGroup.Addon) {
																			$$renderer.push('<!--[-->');

																			InputGroup.Addon($$renderer, {
																				align: 'block-end',
																				children: ($$renderer) => {
																					if (InputGroup.Text) {
																						$$renderer.push('<!--[-->');

																						InputGroup.Text($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->0/500 characters`);
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

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								class: 'justify-end gap-2',
								children: ($$renderer) => {
									Button($$renderer, {
										variant: 'outline',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Cancel`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Submit`);
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
}
import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_group_with_buttons($$renderer) {
	Example($$renderer, {
		title: 'With Buttons',
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
											for: 'input-button-13',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Button`);
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
													InputGroup.Input($$renderer, { id: 'input-button-13' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														children: ($$renderer) => {
															if (InputGroup.Button) {
																$$renderer.push('<!--[-->');

																InputGroup.Button($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Default`);
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

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-button-14' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														children: ($$renderer) => {
															if (InputGroup.Button) {
																$$renderer.push('<!--[-->');

																InputGroup.Button($$renderer, {
																	variant: 'outline',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Outline`);
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

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-button-15' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														children: ($$renderer) => {
															if (InputGroup.Button) {
																$$renderer.push('<!--[-->');

																InputGroup.Button($$renderer, {
																	variant: 'secondary',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Secondary`);
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

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-button-16' });
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
															if (InputGroup.Button) {
																$$renderer.push('<!--[-->');

																InputGroup.Button($$renderer, {
																	variant: 'secondary',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Button`);
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

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-button-17' });
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
															if (InputGroup.Button) {
																$$renderer.push('<!--[-->');

																InputGroup.Button($$renderer, {
																	size: 'icon-xs',
																	children: ($$renderer) => {
																		IconPlaceholder($$renderer, {
																			lucide: 'CopyIcon',
																			tabler: 'IconCopy',
																			hugeicons: 'CopyIcon',
																			phosphor: 'CopyIcon',
																			remixicon: 'RiFileCopyLine'
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

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-button-18' });
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
															if (InputGroup.Button) {
																$$renderer.push('<!--[-->');

																InputGroup.Button($$renderer, {
																	variant: 'secondary',
																	size: 'icon-xs',
																	children: ($$renderer) => {
																		IconPlaceholder($$renderer, {
																			lucide: 'TrashIcon',
																			tabler: 'IconTrash',
																			hugeicons: 'DeleteIcon',
																			phosphor: 'TrashIcon',
																			remixicon: 'RiDeleteBinLine'
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
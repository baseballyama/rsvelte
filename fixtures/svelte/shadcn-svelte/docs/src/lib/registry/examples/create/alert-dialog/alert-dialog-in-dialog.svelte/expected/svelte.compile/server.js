import * as $ from 'svelte/internal/server';
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Alert_dialog_in_dialog($$renderer) {
	let alertOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'In Dialog',
			class: 'items-center',
			children: ($$renderer) => {
				if (Dialog.Root) {
					$$renderer.push('<!--[-->');

					Dialog.Root($$renderer, {
						children: ($$renderer) => {
							if (Dialog.Trigger) {
								$$renderer.push('<!--[-->');

								Dialog.Trigger($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Open Dialog`);
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

							$$renderer.push(` `);

							if (Dialog.Content) {
								$$renderer.push('<!--[-->');

								Dialog.Content($$renderer, {
									children: ($$renderer) => {
										if (Dialog.Header) {
											$$renderer.push('<!--[-->');

											Dialog.Header($$renderer, {
												children: ($$renderer) => {
													if (Dialog.Title) {
														$$renderer.push('<!--[-->');

														Dialog.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Alert Dialog Example`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Dialog.Description) {
														$$renderer.push('<!--[-->');

														Dialog.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Click the button below to open an alert dialog.`);
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

										if (Dialog.Footer) {
											$$renderer.push('<!--[-->');

											Dialog.Footer($$renderer, {
												children: ($$renderer) => {
													if (AlertDialog.Root) {
														$$renderer.push('<!--[-->');

														AlertDialog.Root($$renderer, {
															get open() {
																return alertOpen;
															},

															set open($$value) {
																alertOpen = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																if (AlertDialog.Trigger) {
																	$$renderer.push('<!--[-->');

																	AlertDialog.Trigger($$renderer, {
																		children: ($$renderer) => {
																			Button($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Open Alert Dialog`);
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
																								onclick: () => alertOpen = false,
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
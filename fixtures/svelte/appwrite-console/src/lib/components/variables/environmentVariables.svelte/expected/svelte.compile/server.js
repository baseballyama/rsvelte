import * as $ from 'svelte/internal/server';
import { Empty, Paginator } from '$lib/components';
import { Button } from '$lib/elements/forms';

import {
	Accordion,
	Badge,
	InteractiveText,
	Icon,
	Layout,
	Skeleton,
	Table,
	Tooltip
} from '@appwrite.io/pink-svelte';

import { IconCode, IconUpload, IconPlus } from '@appwrite.io/pink-icons-svelte';
import VariableActionMenu from './variableActionMenu.svelte';
import VariableEditorModal from './variableEditorModal.svelte';
import SecretVariableModal from './secretVariableModal.svelte';
import ImportVariablesModal from './importVariablesModal.svelte';
import CreateVariableModal from './createVariableModal.svelte';
import DeleteVariableModal from './deleteVariableModal.svelte';
import UpdateVariableModal from './updateVariableModal.svelte';
import { Click, trackEvent } from '$lib/actions/analytics';
import { isSmallViewport } from '$lib/stores/viewport';
import { isValidVariableKey } from '$lib/helpers/variables';

export default function EnvironmentVariables($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const DOCS_LINKS = {
			site: 'https://appwrite.io/docs/products/sites/develop#accessing-environment-variables',
			function: 'https://appwrite.io/docs/products/functions/develop#environment-variables'
		};

		let {
			variables = [],
			productLabel = 'site',
			analyticsSource = 'site_configuration',
			analyticsCreateSource = 'site_settings',
			isLoading = false
		} = $$props;

		let showEditorModal = false;
		let showImportModal = false;
		let showSecretModal = false;
		let showCreate = false;
		let showUpdate = false;
		let showDelete = false;
		let currentVariable = undefined;
		const createSource = $.derived(() => analyticsCreateSource || analyticsSource);
		const docsLink = $.derived(() => DOCS_LINKS[productLabel]);

		const tableColumns = $.derived(() => $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)
			? [
				{ id: 'key', width: { min: 120, max: 300 } },
				{ id: 'value', width: { min: 100, max: 200 } },
				{ id: 'actions', width: 40 }
			]
			: [
				{ id: 'key', width: { min: 280, max: 420 } },
				{ id: 'value', width: { min: 200, max: 400 } },
				{ id: 'actions', width: 50 }
			]);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Accordion($$renderer, {
				title: 'Environment variables',
				badge: 'Optional',
				hideDivider: true,
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'xl',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Set up environment variables to securely manage keys and settings for your project. `);

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 'l',
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													direction: 'row',
													gap: 's',
													children: ($$renderer) => {
														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																direction: 'row',
																gap: 's',
																children: ($$renderer) => {
																	Button($$renderer, {
																		secondary: true,
																		size: 's',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Editor`);
																		},

																		$$slots: {
																			default: true,
																			start: ($$renderer) => {
																				Icon($$renderer, { slot: 'start', icon: IconCode });
																			}
																		}
																	});

																	$$renderer.push(`<!----> `);

																	Button($$renderer, {
																		secondary: true,
																		size: 's',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Import .env`);
																		},

																		$$slots: {
																			default: true,
																			start: ($$renderer) => {
																				Icon($$renderer, { slot: 'start', icon: IconUpload });
																			}
																		}
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

														if (variables?.length) {
															$$renderer.push('<!--[0-->');

															Button($$renderer, {
																secondary: true,
																size: 's',
																icon: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport),
																children: ($$renderer) => {
																	if (!$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
																		$$renderer.push(`<!--[0-->Create variable`);
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]-->`);
																},

																$$slots: {
																	default: true,
																	start: ($$renderer) => {
																		Icon($$renderer, { slot: 'start', icon: IconPlus });
																	}
																}
															});
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (isLoading && !variables?.length) {
												$$renderer.push('<!--[0-->');

												if (Table.Root) {
													$$renderer.push('<!--[-->');

													Table.Root($$renderer, {
														class: 'responsive-table',
														columns: tableColumns(),
														children: $.invalid_default_snippet,
														$$slots: {
															default: ($$renderer, { root }) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(Array(3));

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let _ = each_array[$$index];

																	if (Table.Row.Base) {
																		$$renderer.push('<!--[-->');

																		Table.Row.Base($$renderer, {
																			root,
																			children: ($$renderer) => {
																				if (Table.Cell) {
																					$$renderer.push('<!--[-->');

																					Table.Cell($$renderer, {
																						column: 'key',
																						root,
																						children: ($$renderer) => {
																							Skeleton($$renderer, { variant: 'line', width: 120, height: 14 });
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
																						column: 'value',
																						root,
																						children: ($$renderer) => {
																							Skeleton($$renderer, { variant: 'line', width: '100%', height: 14 });
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
																						column: 'actions',
																						root,
																						children: ($$renderer) => {
																							Skeleton($$renderer, { variant: 'line', width: 24, height: 14 });
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

																$$renderer.push(`<!--]-->`);
															},

															header: ($$renderer, { root }) => {
																{
																	if (Table.Header.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Header.Cell($$renderer, {
																			column: 'key',
																			root,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Key`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Table.Header.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Header.Cell($$renderer, {
																			column: 'value',
																			root,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Value`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Table.Header.Cell) {
																		$$renderer.push('<!--[-->');
																		Table.Header.Cell($$renderer, { column: 'actions', root });
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																}
															}
														}
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											} else if (variables?.length) {
												$$renderer.push('<!--[1-->');

												{
													function children($$renderer, paginatedItems) {
														if (Table.Root) {
															$$renderer.push('<!--[-->');

															Table.Root($$renderer, {
																class: 'responsive-table',
																columns: tableColumns(),
																children: $.invalid_default_snippet,
																$$slots: {
																	default: ($$renderer, { root }) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array_1 = $.ensure_array_like(paginatedItems);

																		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																			let variable = each_array_1[$$index_1];

																			if (Table.Row.Base) {
																				$$renderer.push('<!--[-->');

																				Table.Row.Base($$renderer, {
																					root,
																					children: ($$renderer) => {
																						if (Table.Cell) {
																							$$renderer.push('<!--[-->');

																							Table.Cell($$renderer, {
																								column: 'key',
																								root,
																								children: ($$renderer) => {
																									if (Layout.Stack) {
																										$$renderer.push('<!--[-->');

																										Layout.Stack($$renderer, {
																											gap: 'xxs',
																											alignItems: 'center',
																											direction: 'row',
																											inline: true,
																											children: ($$renderer) => {
																												if (!isValidVariableKey(variable.key)) {
																													$$renderer.push('<!--[0-->');

																													Tooltip($$renderer, {
																														maxWidth: '26rem',
																														children: ($$renderer) => {
																															$$renderer.push(`<span class="icon-exclamation u-color-text-danger" aria-hidden="true"></span>`);
																														},

																														$$slots: {
																															default: true,
																															tooltip: ($$renderer) => {
																																{
																																	$$renderer.push(`This key can't be used as an environment
                                                        variable name. Rename it using only letters,
                                                        digits and underscores, without starting
                                                        with a digit.`);
																																}
																															}
																														}
																													});
																												} else {
																													$$renderer.push('<!--[-1-->');
																												}

																												$$renderer.push(`<!--]--> ${$.escape(variable.key)}`);
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

																						if (Table.Cell) {
																							$$renderer.push('<!--[-->');

																							Table.Cell($$renderer, {
																								column: 'value',
																								root,
																								children: ($$renderer) => {
																									$$renderer.push(`<div style="max-width: 100%">`);

																									if (variable.secret) {
																										$$renderer.push('<!--[0-->');

																										Tooltip($$renderer, {
																											maxWidth: '26rem',
																											children: ($$renderer) => {
																												Badge($$renderer, { content: 'Secret', variant: 'secondary', size: 's' });
																											},

																											$$slots: {
																												default: true,
																												tooltip: ($$renderer) => {
																													{
																														$$renderer.push(`This value is secret, you cannot see its
                                                        value.`);
																													}
																												}
																											}
																										});
																									} else {
																										$$renderer.push('<!--[-1-->');
																										InteractiveText($$renderer, { variant: 'secret', isVisible: true, text: variable.value });
																									}

																									$$renderer.push(`<!--]--></div>`);
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
																								column: 'actions',
																								root,
																								children: ($$renderer) => {
																									$$renderer.push(`<div style="margin-inline-start: auto">`);

																									VariableActionMenu($$renderer, {
																										variable,
																										onUpdate: () => {
																											currentVariable = variable;
																											showUpdate = true;
																										},

																										onSecret: () => {
																											currentVariable = variable;
																											showSecretModal = true;
																										},

																										onDelete: () => {
																											currentVariable = variable;
																											showDelete = true;
																										}
																									});

																									$$renderer.push(`<!----></div>`);
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

																		$$renderer.push(`<!--]-->`);
																	},

																	header: ($$renderer, { root }) => {
																		{
																			if (Table.Header.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Header.Cell($$renderer, {
																					column: 'key',
																					root,
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Key`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Header.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Header.Cell($$renderer, {
																					column: 'value',
																					root,
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Value`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Header.Cell) {
																				$$renderer.push('<!--[-->');
																				Table.Header.Cell($$renderer, { column: 'actions', root });
																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}
																	}
																}
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													Paginator($$renderer, {
														items: variables,
														limit: 6,
														hideFooter: variables.length <= 6,
														children,
														$$slots: { default: true }
													});
												}
											} else {
												$$renderer.push('<!--[-1-->');

												Empty($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Create variables to get started`);
													},
													$$slots: { default: true }
												});
											}

											$$renderer.push(`<!--]-->`);
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

			$$renderer.push(`<!----> `);

			if (showEditorModal) {
				$$renderer.push('<!--[0-->');

				VariableEditorModal($$renderer, {
					docsLink: docsLink(),
					get variables() {
						return variables;
					},

					set variables($$value) {
						variables = $$value;
						$$settled = false;
					},

					get showEditor() {
						return showEditorModal;
					},

					set showEditor($$value) {
						showEditorModal = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showSecretModal) {
				$$renderer.push('<!--[0-->');

				SecretVariableModal($$renderer, {
					get show() {
						return showSecretModal;
					},

					set show($$value) {
						showSecretModal = $$value;
						$$settled = false;
					},

					get currentVariable() {
						return currentVariable;
					},

					set currentVariable($$value) {
						currentVariable = $$value;
						$$settled = false;
					},

					get variables() {
						return variables;
					},

					set variables($$value) {
						variables = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showImportModal) {
				$$renderer.push('<!--[0-->');

				ImportVariablesModal($$renderer, {
					get show() {
						return showImportModal;
					},

					set show($$value) {
						showImportModal = $$value;
						$$settled = false;
					},

					get variables() {
						return variables;
					},

					set variables($$value) {
						variables = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showCreate) {
				$$renderer.push('<!--[0-->');

				CreateVariableModal($$renderer, {
					productLabel,
					get show() {
						return showCreate;
					},

					set show($$value) {
						showCreate = $$value;
						$$settled = false;
					},

					get variables() {
						return variables;
					},

					set variables($$value) {
						variables = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showUpdate) {
				$$renderer.push('<!--[0-->');

				UpdateVariableModal($$renderer, {
					productLabel,
					get show() {
						return showUpdate;
					},

					set show($$value) {
						showUpdate = $$value;
						$$settled = false;
					},

					get variables() {
						return variables;
					},

					set variables($$value) {
						variables = $$value;
						$$settled = false;
					},

					get selectedVar() {
						return currentVariable;
					},

					set selectedVar($$value) {
						currentVariable = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showDelete) {
				$$renderer.push('<!--[0-->');

				DeleteVariableModal($$renderer, {
					get show() {
						return showDelete;
					},

					set show($$value) {
						showDelete = $$value;
						$$settled = false;
					},

					get variables() {
						return variables;
					},

					set variables($$value) {
						variables = $$value;
						$$settled = false;
					},

					get currentVariable() {
						return currentVariable;
					},

					set currentVariable($$value) {
						currentVariable = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { variables });
	});
}
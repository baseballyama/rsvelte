import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<span class="icon-exclamation u-color-text-danger" aria-hidden="true"></span>`);
var root_4 = $.from_html(`<!> `, 1);
var root_5 = $.from_html(`<div style="max-width: 100%"><!></div>`);
var root_6 = $.from_html(`<div style="margin-inline-start: auto"><!></div>`);
var root_7 = $.from_html(`Set up environment variables to securely manage keys and settings for your project. <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function EnvironmentVariables($$anchor, $$props) {
	$.push($$props, true);

	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const DOCS_LINKS = {
		site: 'https://appwrite.io/docs/products/sites/develop#accessing-environment-variables',
		function: 'https://appwrite.io/docs/products/functions/develop#environment-variables'
	};

	let variables = $.prop($$props, 'variables', 31, () => $.proxy([])),
		productLabel = $.prop($$props, 'productLabel', 3, 'site'),
		analyticsSource = $.prop($$props, 'analyticsSource', 3, 'site_configuration'),
		analyticsCreateSource = $.prop($$props, 'analyticsCreateSource', 3, 'site_settings'),
		isLoading = $.prop($$props, 'isLoading', 3, false);

	let showEditorModal = $.state(false);
	let showImportModal = $.state(false);
	let showSecretModal = $.state(false);
	let showCreate = $.state(false);
	let showUpdate = $.state(false);
	let showDelete = $.state(false);
	let currentVariable = $.state(undefined);
	const createSource = $.derived(() => analyticsCreateSource() || analyticsSource());
	const docsLink = $.derived(() => DOCS_LINKS[productLabel()]);

	const tableColumns = $.derived(() => $isSmallViewport()
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

	var fragment = root_8();
	var node = $.first_child(fragment);

	Accordion(node, {
		title: 'Environment variables',
		badge: 'Optional',
		hideDivider: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 'xl',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_2 = root_7();
						var node_2 = $.sibling($.first_child(fragment_2));

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 'l',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
										Layout_Stack_2($$anchor, {
											direction: 'row',
											gap: 's',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_1();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
													Layout_Stack_3($$anchor, {
														direction: 'row',
														gap: 's',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_1();
															var node_5 = $.first_child(fragment_5);

															Button(node_5, {
																secondary: true,
																size: 's',
																$$events: {
																	click: () => {
																		$.set(showEditorModal, true);
																		trackEvent(Click.VariablesUpdateClick, { source: analyticsSource() });
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text = $.text('Editor');

																	$.append($$anchor, text);
																},

																$$slots: {
																	default: true,
																	start: ($$anchor, $$slotProps) => {
																		Icon($$anchor, {
																			slot: 'start',
																			get icon() {
																				return IconCode;
																			}
																		});
																	}
																}
															});

															var node_6 = $.sibling(node_5, 2);

															Button(node_6, {
																secondary: true,
																size: 's',
																$$events: {
																	click: () => {
																		$.set(showImportModal, true);
																		trackEvent(Click.VariablesImportClick, { source: analyticsSource() });
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('Import .env');

																	$.append($$anchor, text_1);
																},

																$$slots: {
																	default: true,
																	start: ($$anchor, $$slotProps) => {
																		Icon($$anchor, {
																			slot: 'start',
																			get icon() {
																				return IconUpload;
																			}
																		});
																	}
																}
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_4, 2);

												{
													var consequent_1 = ($$anchor) => {
														Button($$anchor, {
															secondary: true,
															size: 's',
															get icon() {
																return $isSmallViewport();
															},

															$$events: {
																click: () => {
																	$.set(showCreate, true);
																	trackEvent(Click.VariablesCreateClick, { source: $.get(createSource) });
																}
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_9 = $.comment();
																var node_8 = $.first_child(fragment_9);

																{
																	var consequent = ($$anchor) => {
																		var text_2 = $.text('Create variable');

																		$.append($$anchor, text_2);
																	};

																	$.if(node_8, ($$render) => {
																		if (!$isSmallViewport()) $$render(consequent);
																	});
																}

																$.append($$anchor, fragment_9);
															},

															$$slots: {
																default: true,
																start: ($$anchor, $$slotProps) => {
																	Icon($$anchor, {
																		slot: 'start',
																		get icon() {
																			return IconPlus;
																		}
																	});
																}
															}
														});
													};

													$.if(node_7, ($$render) => {
														if (variables()?.length) $$render(consequent_1);
													});
												}

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_3, 2);

									{
										var consequent_2 = ($$anchor) => {
											var fragment_11 = $.comment();
											var node_10 = $.first_child(fragment_11);

											$.component(node_10, () => Table.Root, ($$anchor, Table_Root) => {
												Table_Root($$anchor, {
													class: 'responsive-table',
													get columns() {
														return $.get(tableColumns);
													},
													children: $.invalid_default_snippet,
													$$slots: {
														default: ($$anchor, $$slotProps) => {
															const root = $.derived(() => $$slotProps.root);
															var fragment_12 = $.comment();
															var node_11 = $.first_child(fragment_12);

															$.each(node_11, 16, () => Array(3), $.index, ($$anchor, _) => {
																var fragment_13 = $.comment();
																var node_12 = $.first_child(fragment_13);

																$.component(node_12, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
																	Table_Row_Base($$anchor, {
																		get root() {
																			return $.get(root);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_14 = root_2();
																			var node_13 = $.first_child(fragment_14);

																			$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell) => {
																				Table_Cell($$anchor, {
																					column: 'key',
																					get root() {
																						return $.get(root);
																					},

																					children: ($$anchor, $$slotProps) => {
																						Skeleton($$anchor, { variant: 'line', width: 120, height: 14 });
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_14 = $.sibling(node_13, 2);

																			$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																				Table_Cell_1($$anchor, {
																					column: 'value',
																					get root() {
																						return $.get(root);
																					},

																					children: ($$anchor, $$slotProps) => {
																						Skeleton($$anchor, { variant: 'line', width: '100%', height: 14 });
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_15 = $.sibling(node_14, 2);

																			$.component(node_15, () => Table.Cell, ($$anchor, Table_Cell_2) => {
																				Table_Cell_2($$anchor, {
																					column: 'actions',
																					get root() {
																						return $.get(root);
																					},

																					children: ($$anchor, $$slotProps) => {
																						Skeleton($$anchor, { variant: 'line', width: 24, height: 14 });
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_14);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_13);
															});

															$.append($$anchor, fragment_12);
														},

														header: ($$anchor, $$slotProps) => {
															const root = $.derived(() => $$slotProps.root);
															var fragment_18 = root_2();
															var node_16 = $.first_child(fragment_18);

															$.component(node_16, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
																Table_Header_Cell($$anchor, {
																	column: 'key',
																	get root() {
																		return $.get(root);
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Key');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_17 = $.sibling(node_16, 2);

															$.component(node_17, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
																Table_Header_Cell_1($$anchor, {
																	column: 'value',
																	get root() {
																		return $.get(root);
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Value');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_18 = $.sibling(node_17, 2);

															$.component(node_18, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_2) => {
																Table_Header_Cell_2($$anchor, {
																	column: 'actions',
																	get root() {
																		return $.get(root);
																	}
																});
															});

															$.append($$anchor, fragment_18);
														}
													}
												});
											});

											$.append($$anchor, fragment_11);
										};

										var consequent_5 = ($$anchor) => {
											{
												const children = ($$anchor, paginatedItems = $.noop) => {
													var fragment_20 = $.comment();
													var node_19 = $.first_child(fragment_20);

													$.component(node_19, () => Table.Root, ($$anchor, Table_Root_1) => {
														Table_Root_1($$anchor, {
															class: 'responsive-table',
															get columns() {
																return $.get(tableColumns);
															},
															children: $.invalid_default_snippet,
															$$slots: {
																default: ($$anchor, $$slotProps) => {
																	const root = $.derived(() => $$slotProps.root);
																	var fragment_21 = $.comment();
																	var node_20 = $.first_child(fragment_21);

																	$.each(node_20, 17, paginatedItems, $.index, ($$anchor, variable) => {
																		var fragment_22 = $.comment();
																		var node_21 = $.first_child(fragment_22);

																		$.component(node_21, () => Table.Row.Base, ($$anchor, Table_Row_Base_1) => {
																			Table_Row_Base_1($$anchor, {
																				get root() {
																					return $.get(root);
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_23 = root_2();
																					var node_22 = $.first_child(fragment_23);

																					$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell_3) => {
																						Table_Cell_3($$anchor, {
																							column: 'key',
																							get root() {
																								return $.get(root);
																							},

																							children: ($$anchor, $$slotProps) => {
																								var fragment_24 = $.comment();
																								var node_23 = $.first_child(fragment_24);

																								$.component(node_23, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																									Layout_Stack_4($$anchor, {
																										gap: 'xxs',
																										alignItems: 'center',
																										direction: 'row',
																										inline: true,
																										children: ($$anchor, $$slotProps) => {
																											var fragment_25 = root_4();
																											var node_24 = $.first_child(fragment_25);

																											{
																												var consequent_3 = ($$anchor) => {
																													Tooltip($$anchor, {
																														maxWidth: '26rem',
																														children: ($$anchor, $$slotProps) => {
																															var span = root_3();

																															$.append($$anchor, span);
																														},

																														$$slots: {
																															default: true,
																															tooltip: ($$anchor, $$slotProps) => {
																																var text_5 = $.text('This key can\'t be used as an environment\n                                                        variable name. Rename it using only letters,\n                                                        digits and underscores, without starting\n                                                        with a digit.');

																																$.append($$anchor, text_5);
																															}
																														}
																													});
																												};

																												var d = $.derived(() => !isValidVariableKey($.get(variable).key));

																												$.if(node_24, ($$render) => {
																													if ($.get(d)) $$render(consequent_3);
																												});
																											}

																											var text_6 = $.sibling(node_24);

																											$.template_effect(() => $.set_text(text_6, ` ${$.get(variable).key ?? ''}`));
																											$.append($$anchor, fragment_25);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_24);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_25 = $.sibling(node_22, 2);

																					$.component(node_25, () => Table.Cell, ($$anchor, Table_Cell_4) => {
																						Table_Cell_4($$anchor, {
																							column: 'value',
																							get root() {
																								return $.get(root);
																							},

																							children: ($$anchor, $$slotProps) => {
																								var div = root_5();
																								var node_26 = $.child(div);

																								{
																									var consequent_4 = ($$anchor) => {
																										Tooltip($$anchor, {
																											maxWidth: '26rem',
																											children: ($$anchor, $$slotProps) => {
																												Badge($$anchor, { content: 'Secret', variant: 'secondary', size: 's' });
																											},

																											$$slots: {
																												default: true,
																												tooltip: ($$anchor, $$slotProps) => {
																													var text_7 = $.text('This value is secret, you cannot see its\n                                                        value.');

																													$.append($$anchor, text_7);
																												}
																											}
																										});
																									};

																									var alternate = ($$anchor) => {
																										InteractiveText($$anchor, {
																											variant: 'secret',
																											isVisible: true,
																											get text() {
																												return $.get(variable).value;
																											}
																										});
																									};

																									$.if(node_26, ($$render) => {
																										if ($.get(variable).secret) $$render(consequent_4); else $$render(alternate, -1);
																									});
																								}

																								$.reset(div);
																								$.append($$anchor, div);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_27 = $.sibling(node_25, 2);

																					$.component(node_27, () => Table.Cell, ($$anchor, Table_Cell_5) => {
																						Table_Cell_5($$anchor, {
																							column: 'actions',
																							get root() {
																								return $.get(root);
																							},

																							children: ($$anchor, $$slotProps) => {
																								var div_1 = root_6();
																								var node_28 = $.child(div_1);

																								VariableActionMenu(node_28, {
																									get variable() {
																										return $.get(variable);
																									},

																									onUpdate: () => {
																										$.set(currentVariable, $.get(variable), true);
																										$.set(showUpdate, true);
																									},

																									onSecret: () => {
																										$.set(currentVariable, $.get(variable), true);
																										$.set(showSecretModal, true);
																									},

																									onDelete: () => {
																										$.set(currentVariable, $.get(variable), true);
																										$.set(showDelete, true);
																									}
																								});

																								$.reset(div_1);
																								$.append($$anchor, div_1);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_23);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_22);
																	});

																	$.append($$anchor, fragment_21);
																},

																header: ($$anchor, $$slotProps) => {
																	const root = $.derived(() => $$slotProps.root);
																	var fragment_30 = root_2();
																	var node_29 = $.first_child(fragment_30);

																	$.component(node_29, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_3) => {
																		Table_Header_Cell_3($$anchor, {
																			column: 'key',
																			get root() {
																				return $.get(root);
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_8 = $.text('Key');

																				$.append($$anchor, text_8);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_30 = $.sibling(node_29, 2);

																	$.component(node_30, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_4) => {
																		Table_Header_Cell_4($$anchor, {
																			column: 'value',
																			get root() {
																				return $.get(root);
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_9 = $.text('Value');

																				$.append($$anchor, text_9);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_31 = $.sibling(node_30, 2);

																	$.component(node_31, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_5) => {
																		Table_Header_Cell_5($$anchor, {
																			column: 'actions',
																			get root() {
																				return $.get(root);
																			}
																		});
																	});

																	$.append($$anchor, fragment_30);
																}
															}
														});
													});

													$.append($$anchor, fragment_20);
												};

												let $0 = $.derived(() => variables().length <= 6);

												Paginator($$anchor, {
													get items() {
														return variables();
													},
													limit: 6,
													get hideFooter() {
														return $.get($0);
													},
													children,
													$$slots: { default: true }
												});
											}
										};

										var alternate_1 = ($$anchor) => {
											Empty($$anchor, {
												$$events: {
													click: () => {
														$.set(showCreate, true);
														trackEvent(Click.VariablesCreateClick, { source: $.get(createSource) });
													}
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('Create variables to get started');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});
										};

										$.if(node_9, ($$render) => {
											if (isLoading() && !variables()?.length) $$render(consequent_2); else if (variables()?.length) $$render(consequent_5, 1); else $$render(alternate_1, -1);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_32 = $.sibling(node, 2);

	{
		var consequent_6 = ($$anchor) => {
			VariableEditorModal($$anchor, {
				get docsLink() {
					return $.get(docsLink);
				},

				get variables() {
					return variables();
				},

				set variables($$value) {
					variables($$value);
				},

				get showEditor() {
					return $.get(showEditorModal);
				},

				set showEditor($$value) {
					$.set(showEditorModal, $$value, true);
				}
			});
		};

		$.if(node_32, ($$render) => {
			if ($.get(showEditorModal)) $$render(consequent_6);
		});
	}

	var node_33 = $.sibling(node_32, 2);

	{
		var consequent_7 = ($$anchor) => {
			SecretVariableModal($$anchor, {
				get show() {
					return $.get(showSecretModal);
				},

				set show($$value) {
					$.set(showSecretModal, $$value, true);
				},

				get currentVariable() {
					return $.get(currentVariable);
				},

				set currentVariable($$value) {
					$.set(currentVariable, $$value, true);
				},

				get variables() {
					return variables();
				},

				set variables($$value) {
					variables($$value);
				}
			});
		};

		$.if(node_33, ($$render) => {
			if ($.get(showSecretModal)) $$render(consequent_7);
		});
	}

	var node_34 = $.sibling(node_33, 2);

	{
		var consequent_8 = ($$anchor) => {
			ImportVariablesModal($$anchor, {
				get show() {
					return $.get(showImportModal);
				},

				set show($$value) {
					$.set(showImportModal, $$value, true);
				},

				get variables() {
					return variables();
				},

				set variables($$value) {
					variables($$value);
				}
			});
		};

		$.if(node_34, ($$render) => {
			if ($.get(showImportModal)) $$render(consequent_8);
		});
	}

	var node_35 = $.sibling(node_34, 2);

	{
		var consequent_9 = ($$anchor) => {
			CreateVariableModal($$anchor, {
				get productLabel() {
					return productLabel();
				},

				get show() {
					return $.get(showCreate);
				},

				set show($$value) {
					$.set(showCreate, $$value, true);
				},

				get variables() {
					return variables();
				},

				set variables($$value) {
					variables($$value);
				}
			});
		};

		$.if(node_35, ($$render) => {
			if ($.get(showCreate)) $$render(consequent_9);
		});
	}

	var node_36 = $.sibling(node_35, 2);

	{
		var consequent_10 = ($$anchor) => {
			UpdateVariableModal($$anchor, {
				get productLabel() {
					return productLabel();
				},

				get show() {
					return $.get(showUpdate);
				},

				set show($$value) {
					$.set(showUpdate, $$value, true);
				},

				get variables() {
					return variables();
				},

				set variables($$value) {
					variables($$value);
				},

				get selectedVar() {
					return $.get(currentVariable);
				},

				set selectedVar($$value) {
					$.set(currentVariable, $$value, true);
				}
			});
		};

		$.if(node_36, ($$render) => {
			if ($.get(showUpdate)) $$render(consequent_10);
		});
	}

	var node_37 = $.sibling(node_36, 2);

	{
		var consequent_11 = ($$anchor) => {
			DeleteVariableModal($$anchor, {
				get show() {
					return $.get(showDelete);
				},

				set show($$value) {
					$.set(showDelete, $$value, true);
				},

				get variables() {
					return variables();
				},

				set variables($$value) {
					variables($$value);
				},

				get currentVariable() {
					return $.get(currentVariable);
				},

				set currentVariable($$value) {
					$.set(currentVariable, $$value, true);
				}
			});
		};

		$.if(node_37, ($$render) => {
			if ($.get(showDelete)) $$render(consequent_11);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
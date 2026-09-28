import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from '$lib/components';
import { Link } from '$lib/elements';
import { Badge, Divider, Input, Layout, Table, Tabs, Typography } from '@appwrite.io/pink-svelte';

var root_1 = $.from_html(`Parameters <!>`, 1);
var root_2 = $.from_html(`Headers <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

var root_4 = $.from_html(`<span>Missing headers? Check the <!> to see
                    the supported data and how to log it.</span>`);

export default function LogsRequest($$anchor, $$props) {
	$.push($$props, true);

	let requestTab = $.state('parameters');

	const href = $$props.product === 'site'
		? 'https://appwrite.io/docs/products/sites/logs#log-details'
		: 'https://appwrite.io/docs/products/functions/develop#logging';

	// Make parameters reactive to selectedLog changes
	let parameters = $.derived(() => {
		try {
			// Add dummy base URL to parse relative paths
			const url = new URL($$props.selectedLog.requestPath, 'http://dummy.local');

			if (url.search) {
				return Array.from(url.searchParams.entries()).map(([name, value]) => ({ name, value: decodeURIComponent(value) }));
			}

			return [];
		} catch(error) {
			return [];
		}
	});

	// Update requestTab when parameters or selectedLog changes
	$.user_effect(() => {
		if ($.get(parameters)?.length) {
			$.set(requestTab, 'parameters');
		} else if ($$props.selectedLog.requestHeaders?.length) {
			$.set(requestTab, 'headers');
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						gap: 'none',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tabs.Root, ($$anchor, Tabs_Root) => {
								Tabs_Root($$anchor, {
									variant: 'secondary',
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$anchor, $$slotProps) => {
											const root = $.derived(() => $$slotProps.root);
											var fragment_3 = root_3();
											var node_3 = $.first_child(fragment_3);

											{
												let $0 = $.derived(() => $.get(requestTab) === 'parameters');

												$.component(node_3, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button) => {
													Tabs_Item_Button($$anchor, {
														get root() {
															return $.get(root);
														},

														get active() {
															return $.get($0);
														},
														$$events: { click: () => $.set(requestTab, 'parameters') },
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_4 = root_1();
															var node_4 = $.sibling($.first_child(fragment_4));

															{
																let $0 = $.derived(() => $.get(parameters)?.length?.toString());

																Badge(node_4, {
																	variant: 'secondary',
																	size: 's',
																	get content() {
																		return $.get($0);
																	}
																});
															}

															$.append($$anchor, fragment_4);
														},
														$$slots: { default: true }
													});
												});
											}

											var node_5 = $.sibling(node_3, 2);

											{
												let $0 = $.derived(() => $.get(requestTab) === 'headers');

												$.component(node_5, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button_1) => {
													Tabs_Item_Button_1($$anchor, {
														get root() {
															return $.get(root);
														},

														get active() {
															return $.get($0);
														},
														$$events: { click: () => $.set(requestTab, 'headers') },
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_5 = root_2();
															var node_6 = $.sibling($.first_child(fragment_5));

															{
																let $0 = $.derived(() => $$props.selectedLog?.requestHeaders?.length?.toString());

																Badge(node_6, {
																	variant: 'secondary',
																	size: 's',
																	get content() {
																		return $.get($0);
																	}
																});
															}

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});
											}

											$.append($$anchor, fragment_3);
										}
									}
								});
							});

							var node_7 = $.sibling(node_2, 2);

							Divider(node_7, {});
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_1, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_6 = $.comment();
						var node_9 = $.first_child(fragment_6);

						{
							var consequent = ($$anchor) => {
								var fragment_7 = $.comment();
								var node_10 = $.first_child(fragment_7);

								$.component(node_10, () => Table.Root, ($$anchor, Table_Root) => {
									Table_Root($$anchor, {
										columns: [{ id: 'key', width: 200 }, { id: 'value' }],
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$anchor, $$slotProps) => {
												const root = $.derived(() => $$slotProps.root);
												var fragment_8 = $.comment();
												var node_11 = $.first_child(fragment_8);

												$.each(node_11, 17, () => $.get(parameters), $.index, ($$anchor, parameter) => {
													var fragment_9 = $.comment();
													var node_12 = $.first_child(fragment_9);

													$.component(node_12, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
														Table_Row_Base($$anchor, {
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root_3();
																var node_13 = $.first_child(fragment_10);

																$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell) => {
																	Table_Cell($$anchor, {
																		get root() {
																			return $.get(root);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text = $.text();

																			$.template_effect(() => $.set_text(text, $.get(parameter).name));
																			$.append($$anchor, text);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_14 = $.sibling(node_13, 2);

																$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																	Table_Cell_1($$anchor, {
																		get root() {
																			return $.get(root);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text();

																			$.template_effect(() => $.set_text(text_1, $.get(parameter).value));
																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												});

												$.append($$anchor, fragment_8);
											},

											header: ($$anchor, $$slotProps) => {
												const root = $.derived(() => $$slotProps.root);
												var fragment_13 = root_3();
												var node_15 = $.first_child(fragment_13);

												$.component(node_15, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
													Table_Header_Cell($$anchor, {
														get root() {
															return $.get(root);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Key');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_16 = $.sibling(node_15, 2);

												$.component(node_16, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
													Table_Header_Cell_1($$anchor, {
														get root() {
															return $.get(root);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Value');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_13);
											}
										}
									});
								});

								$.append($$anchor, fragment_7);
							};

							var alternate = ($$anchor) => {
								Card($$anchor, {
									padding: 'xs',
									radius: 's',
									children: ($$anchor, $$slotProps) => {
										var fragment_15 = $.comment();
										var node_17 = $.first_child(fragment_15);

										$.component(node_17, () => Typography.Code, ($$anchor, Typography_Code) => {
											Typography_Code($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('No parameters found.');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_15);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_9, ($$render) => {
								if ($.get(parameters)?.length) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_6);
					};

					var consequent_3 = ($$anchor) => {
						var fragment_16 = $.comment();
						var node_18 = $.first_child(fragment_16);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_17 = root_3();
								var node_19 = $.first_child(fragment_17);

								$.component(node_19, () => Table.Root, ($$anchor, Table_Root_1) => {
									Table_Root_1($$anchor, {
										columns: [{ id: 'key', width: 200 }, { id: 'value' }],
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$anchor, $$slotProps) => {
												const root = $.derived(() => $$slotProps.root);
												var fragment_18 = $.comment();
												var node_20 = $.first_child(fragment_18);

												$.each(node_20, 17, () => $$props.selectedLog.requestHeaders, $.index, ($$anchor, request) => {
													var fragment_19 = $.comment();
													var node_21 = $.first_child(fragment_19);

													$.component(node_21, () => Table.Row.Base, ($$anchor, Table_Row_Base_1) => {
														Table_Row_Base_1($$anchor, {
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_20 = root_3();
																var node_22 = $.first_child(fragment_20);

																$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell_2) => {
																	Table_Cell_2($$anchor, {
																		get root() {
																			return $.get(root);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text();

																			$.template_effect(() => $.set_text(text_5, $.get(request).name));
																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_23 = $.sibling(node_22, 2);

																$.component(node_23, () => Table.Cell, ($$anchor, Table_Cell_3) => {
																	Table_Cell_3($$anchor, {
																		get root() {
																			return $.get(root);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text();

																			$.template_effect(() => $.set_text(text_6, $.get(request).value));
																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_20);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_19);
												});

												$.append($$anchor, fragment_18);
											},

											header: ($$anchor, $$slotProps) => {
												const root = $.derived(() => $$slotProps.root);
												var fragment_23 = root_3();
												var node_24 = $.first_child(fragment_23);

												$.component(node_24, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_2) => {
													Table_Header_Cell_2($$anchor, {
														get root() {
															return $.get(root);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Key');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_25 = $.sibling(node_24, 2);

												$.component(node_25, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_3) => {
													Table_Header_Cell_3($$anchor, {
														get root() {
															return $.get(root);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('Value');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_23);
											}
										}
									});
								});

								var node_26 = $.sibling(node_19, 2);

								$.component(node_26, () => Input.Helper, ($$anchor, Input_Helper) => {
									Input_Helper($$anchor, {
										state: 'default',
										children: ($$anchor, $$slotProps) => {
											var span = root_4();
											var node_27 = $.sibling($.child(span));

											Link(node_27, {
												variant: 'muted',
												get href() {
													return href;
												},
												external: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('docs');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});

											$.next();
											$.reset(span);
											$.append($$anchor, span);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_17);
							};

							var alternate_1 = ($$anchor) => {
								Card($$anchor, {
									padding: 'xs',
									radius: 's',
									children: ($$anchor, $$slotProps) => {
										var fragment_25 = $.comment();
										var node_28 = $.first_child(fragment_25);

										$.component(node_28, () => Typography.Code, ($$anchor, Typography_Code_1) => {
											Typography_Code_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('No headers found.');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_25);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_18, ($$render) => {
								if ($$props.selectedLog.requestHeaders?.length) $$render(consequent_2); else $$render(alternate_1, -1);
							});
						}

						$.append($$anchor, fragment_16);
					};

					$.if(node_8, ($$render) => {
						if ($.get(requestTab) === 'parameters') $$render(consequent_1); else if ($.get(requestTab) === 'headers') $$render(consequent_3, 1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
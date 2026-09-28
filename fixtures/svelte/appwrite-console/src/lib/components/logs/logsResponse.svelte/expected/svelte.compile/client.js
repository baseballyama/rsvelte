import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from '$lib/components';
import { Link } from '$lib/elements';

import {
	Badge,
	Divider,
	InlineCode,
	Input,
	Layout,
	Logs,
	Table,
	Tabs,
	Typography
} from '@appwrite.io/pink-svelte';

import { onMount } from 'svelte';
import LoggingAlert from './loggingAlert.svelte';

var root_1 = $.from_html(`Headers <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

var root_4 = $.from_html(`<span>Missing headers? Check the <!> to see
                    the supported data and how to log it.</span>`);

var root_5 = $.from_html(
	`Body data is not captured by Appwrite for your user's security and privacy. To
                    display body data in the Logs tab, use <!>. <!>.`,
	1
);

export default function LogsResponse($$anchor, $$props) {
	$.push($$props, true);

	let responseTab = $.state('logs');

	const href = $$props.product === 'site'
		? 'https://appwrite.io/docs/products/sites/logs#log-details'
		: 'https://appwrite.io/docs/products/functions/develop#logging';

	onMount(() => {
		if ($$props.selectedLog?.errors) {
			$.set(responseTab, 'errors');
		} else if ($$props.selectedLog?.logs) {
			$.set(responseTab, 'logs');
		} else if ($$props.selectedLog.requestHeaders?.length) {
			$.set(responseTab, 'headers');
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
											var fragment_3 = root_2();
											var node_3 = $.first_child(fragment_3);

											{
												let $0 = $.derived(() => $.get(responseTab) === 'logs');

												$.component(node_3, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button) => {
													Tabs_Item_Button($$anchor, {
														get root() {
															return $.get(root);
														},

														get active() {
															return $.get($0);
														},
														$$events: { click: () => $.set(responseTab, 'logs') },
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Logs');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});
											}

											var node_4 = $.sibling(node_3, 2);

											{
												let $0 = $.derived(() => $.get(responseTab) === 'errors');

												$.component(node_4, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button_1) => {
													Tabs_Item_Button_1($$anchor, {
														get root() {
															return $.get(root);
														},

														get active() {
															return $.get($0);
														},
														$$events: { click: () => $.set(responseTab, 'errors') },
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Errors');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});
											}

											var node_5 = $.sibling(node_4, 2);

											{
												let $0 = $.derived(() => $.get(responseTab) === 'headers');

												$.component(node_5, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button_2) => {
													Tabs_Item_Button_2($$anchor, {
														get root() {
															return $.get(root);
														},

														get active() {
															return $.get($0);
														},
														$$events: { click: () => $.set(responseTab, 'headers') },
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_4 = root_1();
															var node_6 = $.sibling($.first_child(fragment_4));

															{
																let $0 = $.derived(() => $$props.selectedLog?.responseHeaders?.length?.toString());

																Badge(node_6, {
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

											var node_7 = $.sibling(node_5, 2);

											{
												var consequent = ($$anchor) => {
													var fragment_5 = $.comment();
													var node_8 = $.first_child(fragment_5);

													{
														let $0 = $.derived(() => $.get(responseTab) === 'body');

														$.component(node_8, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button_3) => {
															Tabs_Item_Button_3($$anchor, {
																get root() {
																	return $.get(root);
																},

																get active() {
																	return $.get($0);
																},
																$$events: { click: () => $.set(responseTab, 'body') },
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Body');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														});
													}

													$.append($$anchor, fragment_5);
												};

												$.if(node_7, ($$render) => {
													if ($$props.product !== 'site') $$render(consequent);
												});
											}

											$.append($$anchor, fragment_3);
										}
									}
								});
							});

							var node_9 = $.sibling(node_2, 2);

							Divider(node_9, {});
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_1, 2);

				{
					var consequent_3 = ($$anchor) => {
						var fragment_6 = $.comment();
						var node_11 = $.first_child(fragment_6);

						{
							var consequent_1 = ($$anchor) => {
								Logs($$anchor, {
									get logs() {
										return $$props.selectedLog.logs;
									}
								});
							};

							var consequent_2 = ($$anchor) => {
								LoggingAlert($$anchor, {
									get product() {
										return $$props.product;
									}
								});
							};

							var alternate = ($$anchor) => {
								Card($$anchor, {
									padding: 'xs',
									radius: 's',
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = $.comment();
										var node_12 = $.first_child(fragment_10);

										$.component(node_12, () => Typography.Code, ($$anchor, Typography_Code) => {
											Typography_Code($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('No logs found.');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_11, ($$render) => {
								if ($$props.selectedLog.logs) $$render(consequent_1); else if (!$$props.logging) $$render(consequent_2, 1); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_6);
					};

					var consequent_6 = ($$anchor) => {
						var fragment_11 = $.comment();
						var node_13 = $.first_child(fragment_11);

						{
							var consequent_4 = ($$anchor) => {
								Logs($$anchor, {
									get logs() {
										return $$props.selectedLog.errors;
									}
								});
							};

							var consequent_5 = ($$anchor) => {
								LoggingAlert($$anchor, {
									get product() {
										return $$props.product;
									}
								});
							};

							var alternate_1 = ($$anchor) => {
								Card($$anchor, {
									padding: 'xs',
									radius: 's',
									children: ($$anchor, $$slotProps) => {
										var fragment_15 = $.comment();
										var node_14 = $.first_child(fragment_15);

										$.component(node_14, () => Typography.Code, ($$anchor, Typography_Code_1) => {
											Typography_Code_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('No errors found.');

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

							$.if(node_13, ($$render) => {
								if ($$props.selectedLog.errors) $$render(consequent_4); else if (!$$props.logging) $$render(consequent_5, 1); else $$render(alternate_1, -1);
							});
						}

						$.append($$anchor, fragment_11);
					};

					var consequent_8 = ($$anchor) => {
						var fragment_16 = $.comment();
						var node_15 = $.first_child(fragment_16);

						{
							var consequent_7 = ($$anchor) => {
								var fragment_17 = root_3();
								var node_16 = $.first_child(fragment_17);

								$.component(node_16, () => Table.Root, ($$anchor, Table_Root) => {
									Table_Root($$anchor, {
										columns: [{ id: 'key', width: 200 }, { id: 'value' }],
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$anchor, $$slotProps) => {
												const root = $.derived(() => $$slotProps.root);
												var fragment_18 = $.comment();
												var node_17 = $.first_child(fragment_18);

												$.each(node_17, 17, () => $$props.selectedLog.responseHeaders, $.index, ($$anchor, request) => {
													var fragment_19 = $.comment();
													var node_18 = $.first_child(fragment_19);

													$.component(node_18, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
														Table_Row_Base($$anchor, {
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_20 = root_3();
																var node_19 = $.first_child(fragment_20);

																$.component(node_19, () => Table.Cell, ($$anchor, Table_Cell) => {
																	Table_Cell($$anchor, {
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

																var node_20 = $.sibling(node_19, 2);

																$.component(node_20, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																	Table_Cell_1($$anchor, {
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
												var node_21 = $.first_child(fragment_23);

												$.component(node_21, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
													Table_Header_Cell($$anchor, {
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

												var node_22 = $.sibling(node_21, 2);

												$.component(node_22, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
													Table_Header_Cell_1($$anchor, {
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

								var node_23 = $.sibling(node_16, 2);

								$.component(node_23, () => Input.Helper, ($$anchor, Input_Helper) => {
									Input_Helper($$anchor, {
										state: 'default',
										children: ($$anchor, $$slotProps) => {
											var span = root_4();
											var node_24 = $.sibling($.child(span));

											Link(node_24, {
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

							var alternate_2 = ($$anchor) => {
								Card($$anchor, {
									padding: 'xs',
									radius: 's',
									children: ($$anchor, $$slotProps) => {
										var fragment_25 = $.comment();
										var node_25 = $.first_child(fragment_25);

										$.component(node_25, () => Typography.Code, ($$anchor, Typography_Code_2) => {
											Typography_Code_2($$anchor, {
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

							$.if(node_15, ($$render) => {
								if ($$props.selectedLog.responseHeaders?.length) $$render(consequent_7); else $$render(alternate_2, -1);
							});
						}

						$.append($$anchor, fragment_16);
					};

					var consequent_10 = ($$anchor) => {
						var fragment_26 = $.comment();
						var node_26 = $.first_child(fragment_26);

						{
							var consequent_9 = ($$anchor) => {
								Logs($$anchor, {
									get logs() {
										return $$props.selectedLog.responseBody;
									}
								});
							};

							var alternate_3 = ($$anchor) => {
								Card($$anchor, {
									padding: 'xs',
									radius: 's',
									children: ($$anchor, $$slotProps) => {
										var fragment_29 = $.comment();
										var node_27 = $.first_child(fragment_29);

										$.component(node_27, () => Typography.Text, ($$anchor, Typography_Text) => {
											Typography_Text($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_30 = root_5();
													var node_28 = $.sibling($.first_child(fragment_30));

													InlineCode(node_28, { code: 'context.log()', size: 's' });

													var node_29 = $.sibling(node_28, 2);

													Link(node_29, {
														external: true,
														get href() {
															return href;
														},
														variant: 'muted',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Learn more');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});

													$.next();
													$.append($$anchor, fragment_30);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_29);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_26, ($$render) => {
								if ($$props.selectedLog.responseBody) $$render(consequent_9); else $$render(alternate_3, -1);
							});
						}

						$.append($$anchor, fragment_26);
					};

					$.if(node_10, ($$render) => {
						if ($.get(responseTab) === 'logs') $$render(consequent_3); else if ($.get(responseTab) === 'errors') $$render(consequent_6, 1); else if ($.get(responseTab) === 'headers') $$render(consequent_8, 2); else if ($.get(responseTab) === 'body') $$render(consequent_10, 3);
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
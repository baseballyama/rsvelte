import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Link } from '$lib/elements';
import { Badge, Layout, Typography, Table, InteractiveText, Alert } from '@appwrite.io/pink-svelte';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { getSubdomain } from '$lib/helpers/tlds';
import { isCloud } from '$lib/system';
import { getProxyRuleStatusBadge } from './status';

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<span>CAA</span> <!>`, 1);

var root_4 = $.from_html(
	`Since <!> is an apex domain, CNAME
                    record is only supported by certain providers. If yours doesn't, please verify using <!> instead.
                    If you're using Cloudflare or another CDN, make sure the proxy is disabled (set to
                    DNS only) for this record, since Appwrite serves your domain through its own CDN.`,
	1
);

var root_5 = $.from_html(`or <!>`, 1);

var root_6 = $.from_html(
	`Since <!> is an apex domain, CNAME
                    record is only supported by certain providers. If yours doesn't, please verify using <!> instead. If you're using Cloudflare or another CDN, make sure the proxy is disabled
                    (set to DNS only) for this record, since Appwrite serves your domain through its own
                    CDN.`,
	1
);

var root_7 = $.from_html(`A list of all domain providers and their DNS setting is available <!>.`, 1);

export default function RecordTable($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let service = $.prop($$props, 'service', 3, 'general'),
		onNavigateToNameservers = $.prop($$props, 'onNavigateToNameservers', 3, () => {}),
		onNavigateToA = $.prop($$props, 'onNavigateToA', 3, () => {}),
		onNavigateToAAAA = $.prop($$props, 'onNavigateToAAAA', 3, () => {});

	const subdomain = $.derived(() => getSubdomain($$props.domain));

	const caaText = $.derived(() => $regionalConsoleVariables()._APP_DOMAIN_TARGET_CAA?.includes(' ')
		? $regionalConsoleVariables()._APP_DOMAIN_TARGET_CAA
		: `0 issue "${$regionalConsoleVariables()._APP_DOMAIN_TARGET_CAA}"`);

	const aTabVisible = $.derived(() => !isCloud && Boolean($regionalConsoleVariables()._APP_DOMAIN_TARGET_A) && $regionalConsoleVariables()._APP_DOMAIN_TARGET_A !== '127.0.0.1');
	const aaaaTabVisible = $.derived(() => !isCloud && Boolean($regionalConsoleVariables()._APP_DOMAIN_TARGET_AAAA) && $regionalConsoleVariables()._APP_DOMAIN_TARGET_AAAA !== '::1');

	function setTarget() {
		switch ($$props.variant) {
			case 'cname':
				if (service() === 'sites') {
					return $regionalConsoleVariables()._APP_DOMAIN_SITES;
				} else {
					return $regionalConsoleVariables()._APP_DOMAIN_TARGET_CNAME;
				}

			case 'a':
				return $regionalConsoleVariables()._APP_DOMAIN_TARGET_A;

			case 'aaaa':
				return $regionalConsoleVariables()._APP_DOMAIN_TARGET_AAAA;
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 'xl',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						gap: 's',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
								Layout_Stack_2($$anchor, {
									gap: 's',
									direction: 'row',
									alignItems: 'center',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
											Typography_Text($$anchor, {
												variant: 'l-500',
												color: '--fgcolor-neutral-primary',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, $$props.domain));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										{
											var consequent_2 = ($$anchor) => {
												const statusBadge = $.derived(() => getProxyRuleStatusBadge($$props.ruleStatus));
												var fragment_5 = $.comment();
												var node_5 = $.first_child(fragment_5);

												{
													var consequent = ($$anchor) => {
														Badge($$anchor, {
															variant: 'secondary',
															get type() {
																return $.get(statusBadge).type;
															},
															size: 'xs',
															get content() {
																return $.get(statusBadge).content;
															}
														});
													};

													var consequent_1 = ($$anchor) => {
														Badge($$anchor, {
															variant: 'secondary',
															type: 'success',
															size: 'xs',
															content: 'Verified'
														});
													};

													$.if(node_5, ($$render) => {
														if ($.get(statusBadge)) $$render(consequent); else if ($$props.verified === true) $$render(consequent_1, 1);
													});
												}

												$.append($$anchor, fragment_5);
											};

											$.if(node_4, ($$render) => {
												if ($$props.verified !== undefined) $$render(consequent_2);
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_2, 2);

							$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text_1) => {
								Typography_Text_1($$anchor, {
									variant: 'm-400',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, `Add the following ${$regionalConsoleVariables()._APP_DOMAIN_TARGET_CAA ? 'records' : 'record'} on your DNS provider. Note that DNS changes may take up to 48 hours to propagate
            fully.`));

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_1, 2);

				$.component(node_7, () => Table.Root, ($$anchor, Table_Root) => {
					Table_Root($$anchor, {
						class: 'responsive-table',
						columns: [
							{ id: 'type', width: { min: 150 } },
							{ id: 'name', width: { min: 80 } },
							{ id: 'value', width: { min: 100 } }
						],
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const root = $.derived(() => $$slotProps.root);
								var fragment_9 = root_1();
								var node_8 = $.first_child(fragment_9);

								$.component(node_8, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
									Table_Row_Base($$anchor, {
										get root() {
											return $.get(root);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_10 = root_2();
											var node_9 = $.first_child(fragment_10);

											$.component(node_9, () => Table.Cell, ($$anchor, Table_Cell) => {
												Table_Cell($$anchor, {
													column: 'type',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text();

														$.template_effect(($0) => $.set_text(text_2, $0), [() => $$props.variant.toUpperCase()]);
														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											var node_10 = $.sibling(node_9, 2);

											$.component(node_10, () => Table.Cell, ($$anchor, Table_Cell_1) => {
												Table_Cell_1($$anchor, {
													column: 'name',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														{
															let $0 = $.derived(() => $.get(subdomain) || '@');

															InteractiveText($$anchor, {
																variant: 'copy',
																isVisible: true,
																get text() {
																	return $.get($0);
																}
															});
														}
													},
													$$slots: { default: true }
												});
											});

											var node_11 = $.sibling(node_10, 2);

											$.component(node_11, () => Table.Cell, ($$anchor, Table_Cell_2) => {
												Table_Cell_2($$anchor, {
													column: 'value',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														{
															let $0 = $.derived(setTarget);

															InteractiveText($$anchor, {
																variant: 'copy',
																isVisible: true,
																get text() {
																	return $.get($0);
																}
															});
														}
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});
								});

								var node_12 = $.sibling(node_8, 2);

								{
									var consequent_3 = ($$anchor) => {
										var fragment_14 = $.comment();
										var node_13 = $.first_child(fragment_14);

										$.component(node_13, () => Table.Row.Base, ($$anchor, Table_Row_Base_1) => {
											Table_Row_Base_1($$anchor, {
												get root() {
													return $.get(root);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root_2();
													var node_14 = $.first_child(fragment_15);

													$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															column: 'type',
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_16 = $.comment();
																var node_15 = $.first_child(fragment_16);

																$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																	Layout_Stack_3($$anchor, {
																		gap: 's',
																		direction: 'row',
																		alignItems: 'center',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_17 = root_3();
																			var node_16 = $.sibling($.first_child(fragment_17), 2);

																			Badge(node_16, { variant: 'secondary', size: 'xs', content: 'Recommended' });
																			$.append($$anchor, fragment_17);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_16);
															},
															$$slots: { default: true }
														});
													});

													var node_17 = $.sibling(node_14, 2);

													$.component(node_17, () => Table.Cell, ($$anchor, Table_Cell_4) => {
														Table_Cell_4($$anchor, {
															column: 'name',
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('@');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_18 = $.sibling(node_17, 2);

													$.component(node_18, () => Table.Cell, ($$anchor, Table_Cell_5) => {
														Table_Cell_5($$anchor, {
															column: 'value',
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																InteractiveText($$anchor, {
																	variant: 'copy',
																	isVisible: true,
																	get text() {
																		return $.get(caaText);
																	}
																});
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_14);
									};

									$.if(node_12, ($$render) => {
										if ($regionalConsoleVariables()._APP_DOMAIN_TARGET_CAA) $$render(consequent_3);
									});
								}

								$.append($$anchor, fragment_9);
							},

							header: ($$anchor, $$slotProps) => {
								const root = $.derived(() => $$slotProps.root);
								var fragment_19 = root_2();
								var node_19 = $.first_child(fragment_19);

								$.component(node_19, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
									Table_Header_Cell($$anchor, {
										column: 'type',
										get root() {
											return $.get(root);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Type');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});
								});

								var node_20 = $.sibling(node_19, 2);

								$.component(node_20, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
									Table_Header_Cell_1($$anchor, {
										column: 'name',
										get root() {
											return $.get(root);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Name');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});
								});

								var node_21 = $.sibling(node_20, 2);

								$.component(node_21, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_2) => {
									Table_Header_Cell_2($$anchor, {
										column: 'value',
										get root() {
											return $.get(root);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Value');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_19);
							}
						}
					});
				});

				var node_22 = $.sibling(node_7, 2);

				$.component(node_22, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
					Layout_Stack_4($$anchor, {
						gap: 's',
						direction: 'row',
						alignItems: 'center',
						children: ($$anchor, $$slotProps) => {
							var fragment_20 = $.comment();
							var node_23 = $.first_child(fragment_20);

							{
								var consequent_9 = ($$anchor) => {
									var fragment_21 = $.comment();
									var node_24 = $.first_child(fragment_21);

									{
										var consequent_4 = ($$anchor) => {
											var fragment_22 = $.comment();
											var node_25 = $.first_child(fragment_22);

											$.component(node_25, () => Alert.Inline, ($$anchor, Alert_Inline) => {
												Alert_Inline($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_23 = root_4();
														var node_26 = $.sibling($.first_child(fragment_23));

														Badge(node_26, {
															variant: 'secondary',
															size: 's',
															get content() {
																return $$props.domain;
															}
														});

														var node_27 = $.sibling(node_26, 2);

														Link(node_27, {
															variant: 'muted',
															$$events: {
																click: function (...$$args) {
																	onNavigateToNameservers()?.apply(this, $$args);
																}
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('nameservers');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});

														$.next();
														$.append($$anchor, fragment_23);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_22);
										};

										var consequent_8 = ($$anchor) => {
											var fragment_24 = $.comment();
											var node_28 = $.first_child(fragment_24);

											$.component(node_28, () => Alert.Inline, ($$anchor, Alert_Inline_1) => {
												Alert_Inline_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_25 = root_6();
														var node_29 = $.sibling($.first_child(fragment_25));

														Badge(node_29, {
															variant: 'secondary',
															size: 's',
															get content() {
																return $$props.domain;
															}
														});

														var node_30 = $.sibling(node_29, 2);

														{
															var consequent_6 = ($$anchor) => {
																var fragment_26 = root_1();
																var node_31 = $.first_child(fragment_26);

																Link(node_31, {
																	variant: 'muted',
																	$$events: {
																		click: function (...$$args) {
																			onNavigateToA()?.apply(this, $$args);
																		}
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('A record');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});

																var node_32 = $.sibling(node_31, 2);

																{
																	var consequent_5 = ($$anchor) => {
																		var fragment_27 = root_5();
																		var node_33 = $.sibling($.first_child(fragment_27));

																		Link(node_33, {
																			variant: 'muted',
																			$$events: {
																				click: function (...$$args) {
																					onNavigateToAAAA()?.apply(this, $$args);
																				}
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_9 = $.text('AAAA record');

																				$.append($$anchor, text_9);
																			},
																			$$slots: { default: true }
																		});

																		$.append($$anchor, fragment_27);
																	};

																	$.if(node_32, ($$render) => {
																		if ($.get(aaaaTabVisible)) $$render(consequent_5);
																	});
																}

																$.append($$anchor, fragment_26);
															};

															var consequent_7 = ($$anchor) => {
																Link($$anchor, {
																	variant: 'muted',
																	$$events: {
																		click: function (...$$args) {
																			onNavigateToAAAA()?.apply(this, $$args);
																		}
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('AAAA record');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															};

															$.if(node_30, ($$render) => {
																if ($.get(aTabVisible)) $$render(consequent_6); else if ($.get(aaaaTabVisible)) $$render(consequent_7, 1);
															});
														}

														$.next();
														$.append($$anchor, fragment_25);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_24);
										};

										$.if(node_24, ($$render) => {
											if (isCloud) $$render(consequent_4); else if ($.get(aTabVisible) || $.get(aaaaTabVisible)) $$render(consequent_8, 1);
										});
									}

									$.append($$anchor, fragment_21);
								};

								var alternate = ($$anchor) => {
									var fragment_29 = $.comment();
									var node_34 = $.first_child(fragment_29);

									$.component(node_34, () => Typography.Text, ($$anchor, Typography_Text_2) => {
										Typography_Text_2($$anchor, {
											variant: 'm-400',
											color: '--fgcolor-neutral-secondary',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_30 = root_7();
												var node_35 = $.sibling($.first_child(fragment_30));

												Link(node_35, {
													variant: 'muted',
													external: true,
													href: 'https://appwrite.io/docs/advanced/platform/custom-domains',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_11 = $.text('here');

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
								};

								$.if(node_23, ($$render) => {
									if ($$props.variant === 'cname' && !$.get(subdomain)) $$render(consequent_9); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_20);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
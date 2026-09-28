import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Click, trackEvent } from '$lib/actions/analytics';
import { Link } from '$lib/elements';
import { Button } from '$lib/elements/forms';
import { IconDotsHorizontal, IconRefresh, IconTerminal, IconTrash } from '@appwrite.io/pink-icons-svelte';

import {
	ActionMenu,
	Badge,
	Divider,
	Icon,
	Layout,
	Popover,
	Table,
	Typography
} from '@appwrite.io/pink-svelte';

import DeleteDomainModal from './deleteDomainModal.svelte';
import RetryDomainModal from './retryDomainModal.svelte';
import { columns } from './store';
import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';
import DnsRecordsAction from '$lib/components/domains/dnsRecordsAction.svelte';

import {
	getProxyRuleStatusBadge,
	getProxyRuleUpdatedPrefix,
	isProxyRuleLogsViewable,
	isProxyRuleRetryable,
	isProxyRuleVerified
} from '$lib/components/domains/status';

import ViewLogsModal from '$lib/components/domains/viewLogsModal.svelte';
import { timeFromNowShort } from '$lib/helpers/date';

var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="action-menu-divider svelte-sghnos"><!></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const $regionalProtocol = () => $.store_get(regionalProtocol, '$regionalProtocol', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showDelete = $.state(false);
	let showRetry = $.state(false);
	let showLogs = $.state(false);
	let selectedProxyRule = $.state(null);

	const proxyTarget = (proxy) => {
		return proxy?.redirectUrl
			? 'Redirect to ' + proxy.redirectUrl
			: proxy?.deploymentVcsProviderBranch
				? 'Deployed from ' + proxy.deploymentVcsProviderBranch
				: 'Active deployment';
	};

	function updatedLabel(proxyRule) {
		if (isProxyRuleVerified(proxyRule.status)) {
			return '';
		}

		const timeStr = timeFromNowShort(proxyRule.$updatedAt);

		if (timeStr === 'n/a') {
			return '';
		}

		const prefix = getProxyRuleUpdatedPrefix(proxyRule.status);

		return prefix + ' ' + timeStr;
	}

	var fragment = root_5();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [...$columns(), { id: 'actions', width: 40 }]);

		$.component(node, () => Table.Root, ($$anchor, Table_Root) => {
			Table_Root($$anchor, {
				get columns() {
					return $.get($0);
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const root = $.derived(() => $$slotProps.root);
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						$.each(node_1, 17, () => $$props.proxyRules.rules, (proxyRule) => proxyRule.$id, ($$anchor, proxyRule) => {
							const isRetryable = $.derived(() => isProxyRuleRetryable($.get(proxyRule).status));
							const isLogsViewable = $.derived(() => isProxyRuleLogsViewable($.get(proxyRule)));
							const statusBadge = $.derived(() => getProxyRuleStatusBadge($.get(proxyRule).status));
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
								Table_Row_Base($$anchor, {
									get root() {
										return $.get(root);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_2();
										var node_3 = $.first_child(fragment_3);

										$.each(node_3, 1, $columns, $.index, ($$anchor, column) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Table.Cell, ($$anchor, Table_Cell) => {
												Table_Cell($$anchor, {
													get column() {
														return $.get(column).id;
													},

													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_5 = $.first_child(fragment_5);

														{
															var consequent_3 = ($$anchor) => {
																var fragment_6 = $.comment();
																var node_6 = $.first_child(fragment_6);

																$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack) => {
																	Layout_Stack($$anchor, {
																		direction: 'row',
																		gap: 'xs',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root_2();
																			var node_7 = $.first_child(fragment_7);

																			{
																				let $0 = $.derived(() => `${$regionalProtocol()}${$.get(proxyRule).domain}`);

																				Link(node_7, {
																					external: true,
																					variant: 'quiet-muted',
																					get href() {
																						return $.get($0);
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_8 = $.comment();
																						var node_8 = $.first_child(fragment_8);

																						$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text) => {
																							Typography_Text($$anchor, {
																								truncate: true,
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text = $.text();

																									$.template_effect(() => $.set_text(text, $.get(proxyRule).domain));
																									$.append($$anchor, text);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_8);
																					},
																					$$slots: { default: true }
																				});
																			}

																			var node_9 = $.sibling(node_7, 2);

																			$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
																				Layout_Stack_1($$anchor, {
																					direction: 'row',
																					gap: 's',
																					alignItems: 'center',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = root_1();
																						var node_10 = $.first_child(fragment_10);

																						{
																							var consequent = ($$anchor) => {
																								Badge($$anchor, {
																									variant: 'secondary',
																									get type() {
																										return $.get(statusBadge).type;
																									},

																									get content() {
																										return $.get(statusBadge).content;
																									},
																									size: 'xs'
																								});
																							};

																							$.if(node_10, ($$render) => {
																								if ($.get(statusBadge)) $$render(consequent);
																							});
																						}

																						var node_11 = $.sibling(node_10, 2);

																						{
																							var consequent_1 = ($$anchor) => {
																								Link($$anchor, {
																									size: 's',
																									variant: 'muted',
																									$$events: {
																										click: (e) => {
																											e.preventDefault();
																											$.set(selectedProxyRule, $.get(proxyRule), true);
																											$.set(showRetry, true);
																										}
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_1 = $.text('Retry');

																										$.append($$anchor, text_1);
																									},
																									$$slots: { default: true }
																								});
																							};

																							$.if(node_11, ($$render) => {
																								if ($.get(isRetryable)) $$render(consequent_1);
																							});
																						}

																						var node_12 = $.sibling(node_11, 2);

																						{
																							var consequent_2 = ($$anchor) => {
																								Link($$anchor, {
																									size: 's',
																									variant: 'muted',
																									$$events: {
																										click: (e) => {
																											e.preventDefault();
																											$.set(selectedProxyRule, $.get(proxyRule), true);
																											$.set(showLogs, true);
																										}
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_2 = $.text('View logs');

																										$.append($$anchor, text_2);
																									},
																									$$slots: { default: true }
																								});
																							};

																							$.if(node_12, ($$render) => {
																								if ($.get(isLogsViewable)) $$render(consequent_2);
																							});
																						}

																						$.append($$anchor, fragment_10);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_6);
															};

															var consequent_4 = ($$anchor) => {
																var text_3 = $.text();

																$.template_effect(($0) => $.set_text(text_3, $0), [() => proxyTarget($.get(proxyRule))]);
																$.append($$anchor, text_3);
															};

															var consequent_5 = ($$anchor) => {
																var fragment_15 = $.comment();
																var node_13 = $.first_child(fragment_15);

																$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
																	Layout_Stack_2($$anchor, {
																		direction: 'row',
																		justifyContent: 'flex-end',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_16 = $.comment();
																			var node_14 = $.first_child(fragment_16);

																			$.component(node_14, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																				Typography_Text_1($$anchor, {
																					variant: 'm-400',
																					color: '--fgcolor-neutral-tertiary',
																					style: 'font-size: 0.875rem;',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text();

																						$.template_effect(($0) => $.set_text(text_4, $0), [() => updatedLabel($.get(proxyRule))]);
																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_16);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_15);
															};

															var d = $.derived(() => $.get(column).id === 'updated' && !isProxyRuleVerified($.get(proxyRule).status));

															$.if(node_5, ($$render) => {
																if ($.get(column).id === 'domain') $$render(consequent_3); else if ($.get(column).id === 'target') $$render(consequent_4, 1); else if ($.get(d)) $$render(consequent_5, 2);
															});
														}

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										});

										var node_15 = $.sibling(node_3, 2);

										$.component(node_15, () => Table.Cell, ($$anchor, Table_Cell_1) => {
											Table_Cell_1($$anchor, {
												column: 'actions',
												get root() {
													return $.get(root);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_18 = $.comment();
													var node_16 = $.first_child(fragment_18);

													$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
														Layout_Stack_3($$anchor, {
															direction: 'row',
															justifyContent: 'flex-end',
															children: ($$anchor, $$slotProps) => {
																Popover($$anchor, {
																	placement: 'bottom-start',
																	padding: 'none',
																	children: $.invalid_default_snippet,
																	$$slots: {
																		default: ($$anchor, $$slotProps) => {
																			const toggle = $.derived(() => $$slotProps.toggle);

																			Button($$anchor, {
																				text: true,
																				icon: true,
																				$$events: {
																					click: (e) => {
																						e.preventDefault();
																						$.get(toggle)(e);
																					}
																				},

																				children: ($$anchor, $$slotProps) => {
																					Icon($$anchor, {
																						get icon() {
																							return IconDotsHorizontal;
																						},
																						size: 's'
																					});
																				},
																				$$slots: { default: true }
																			});
																		},

																		tooltip: ($$anchor, $$slotProps) => {
																			const toggle = $.derived(() => $$slotProps.toggle);
																			var fragment_22 = $.comment();
																			var node_17 = $.first_child(fragment_22);

																			$.component(node_17, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
																				ActionMenu_Root($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_23 = root_4();
																						var node_18 = $.first_child(fragment_23);

																						{
																							var consequent_6 = ($$anchor) => {
																								var fragment_24 = $.comment();
																								var node_19 = $.first_child(fragment_24);

																								$.component(node_19, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																									ActionMenu_Item_Button($$anchor, {
																										get leadingIcon() {
																											return IconTerminal;
																										},

																										$$events: {
																											click: (e) => {
																												$.set(selectedProxyRule, $.get(proxyRule), true);
																												$.set(showLogs, true);
																												$.get(toggle)(e);
																											}
																										},

																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_5 = $.text('View logs');

																											$.append($$anchor, text_5);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_24);
																							};

																							$.if(node_18, ($$render) => {
																								if ($.get(isLogsViewable)) $$render(consequent_6);
																							});
																						}

																						var node_20 = $.sibling(node_18, 2);

																						{
																							var consequent_7 = ($$anchor) => {
																								var fragment_25 = $.comment();
																								var node_21 = $.first_child(fragment_25);

																								$.component(node_21, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_1) => {
																									ActionMenu_Item_Button_1($$anchor, {
																										get leadingIcon() {
																											return IconRefresh;
																										},

																										$$events: {
																											click: (e) => {
																												$.set(selectedProxyRule, $.get(proxyRule), true);
																												$.set(showRetry, true);
																												$.get(toggle)(e);
																											}
																										},

																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_6 = $.text('Retry');

																											$.append($$anchor, text_6);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_25);
																							};

																							$.if(node_20, ($$render) => {
																								if ($.get(isRetryable)) $$render(consequent_7);
																							});
																						}

																						var node_22 = $.sibling(node_20, 2);

																						DnsRecordsAction(node_22, {
																							get rule() {
																								return $.get(proxyRule);
																							},

																							get organizationDomains() {
																								return $$props.organizationDomains;
																							}
																						});

																						var node_23 = $.sibling(node_22, 2);

																						{
																							var consequent_8 = ($$anchor) => {
																								var div = root_3();
																								var node_24 = $.child(div);

																								Divider(node_24, {});
																								$.reset(div);
																								$.append($$anchor, div);
																							};

																							$.if(node_23, ($$render) => {
																								if ($.get(isLogsViewable)) $$render(consequent_8);
																							});
																						}

																						var node_25 = $.sibling(node_23, 2);

																						$.component(node_25, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_2) => {
																							ActionMenu_Item_Button_2($$anchor, {
																								status: 'danger',
																								get leadingIcon() {
																									return IconTrash;
																								},

																								$$events: {
																									click: (e) => {
																										$.set(selectedProxyRule, $.get(proxyRule), true);
																										$.set(showDelete, true);
																										$.get(toggle)(e);
																										trackEvent(Click.DomainDeleteClick, { source: 'functions_domain_overview' });
																									}
																								},

																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_7 = $.text('Delete');

																									$.append($$anchor, text_7);
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
																		}
																	}
																});
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_18);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						});

						$.append($$anchor, fragment_1);
					},

					header: ($$anchor, $$slotProps) => {
						const root = $.derived(() => $$slotProps.root);
						var fragment_26 = root_2();
						var node_26 = $.first_child(fragment_26);

						$.each(node_26, 1, $columns, $.index, ($$anchor, $$item) => {
							let id = () => $.get($$item).id;
							let title = () => $.get($$item).title;
							var fragment_27 = $.comment();
							var node_27 = $.first_child(fragment_27);

							$.component(node_27, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
								Table_Header_Cell($$anchor, {
									get column() {
										return id();
									},

									get root() {
										return $.get(root);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_8 = $.text();

										$.template_effect(() => $.set_text(text_8, title()));
										$.append($$anchor, text_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_27);
						});

						var node_28 = $.sibling(node_26, 2);

						$.component(node_28, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
							Table_Header_Cell_1($$anchor, {
								column: 'actions',
								get root() {
									return $.get(root);
								}
							});
						});

						$.append($$anchor, fragment_26);
					}
				}
			});
		});
	}

	var node_29 = $.sibling(node, 2);

	{
		var consequent_9 = ($$anchor) => {
			DeleteDomainModal($$anchor, {
				get selectedProxyRule() {
					return $.get(selectedProxyRule);
				},

				get show() {
					return $.get(showDelete);
				},

				set show($$value) {
					$.set(showDelete, $$value, true);
				}
			});
		};

		$.if(node_29, ($$render) => {
			if ($.get(showDelete)) $$render(consequent_9);
		});
	}

	var node_30 = $.sibling(node_29, 2);

	{
		var consequent_10 = ($$anchor) => {
			RetryDomainModal($$anchor, {
				get selectedProxyRule() {
					return $.get(selectedProxyRule);
				},

				get domainsList() {
					return $$props.organizationDomains;
				},

				get show() {
					return $.get(showRetry);
				},

				set show($$value) {
					$.set(showRetry, $$value, true);
				}
			});
		};

		$.if(node_30, ($$render) => {
			if ($.get(showRetry)) $$render(consequent_10);
		});
	}

	var node_31 = $.sibling(node_30, 2);

	{
		var consequent_11 = ($$anchor) => {
			ViewLogsModal($$anchor, {
				get selectedProxyRule() {
					return $.get(selectedProxyRule);
				},

				get domainsList() {
					return $$props.organizationDomains;
				},

				get show() {
					return $.get(showLogs);
				},

				set show($$value) {
					$.set(showLogs, $$value, true);
				}
			});
		};

		$.if(node_31, ($$render) => {
			if ($.get(showLogs)) $$render(consequent_11);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
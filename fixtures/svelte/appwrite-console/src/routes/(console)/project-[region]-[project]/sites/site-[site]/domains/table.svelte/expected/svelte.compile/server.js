import * as $ from 'svelte/internal/server';
import { Click, trackEvent } from '$lib/actions/analytics';
import { Link } from '$lib/elements';
import { Button } from '$lib/elements/forms';
import { IconDotsHorizontal, IconRefresh, IconTrash, IconTerminal } from '@appwrite.io/pink-icons-svelte';

import {
	ActionMenu,
	Badge,
	Icon,
	Layout,
	Popover,
	Table,
	Typography,
	Divider
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

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { proxyRules, organizationDomains } = $$props;
		let showDelete = false;
		let showRetry = false;
		let showLogs = false;
		let selectedProxyRule = null;

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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Table.Root) {
				$$renderer.push('<!--[-->');

				Table.Root($$renderer, {
					columns: [
						...$.store_get($$store_subs ??= {}, '$columns', columns),
						{ id: 'actions', width: 40 }
					],
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { root }) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(proxyRules.rules);

							for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
								let proxyRule = each_array[$$index_2];
								const isRetryable = isProxyRuleRetryable(proxyRule.status);
								const isLogsViewable = isProxyRuleLogsViewable(proxyRule);
								const statusBadge = getProxyRuleStatusBadge(proxyRule.status);

								if (Table.Row.Base) {
									$$renderer.push('<!--[-->');

									Table.Row.Base($$renderer, {
										root,
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array_1 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let column = each_array_1[$$index_1];

												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														column: column.id,
														root,
														children: ($$renderer) => {
															if (column.id === 'domain') {
																$$renderer.push('<!--[0-->');

																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		direction: 'row',
																		gap: 'xs',
																		children: ($$renderer) => {
																			Link($$renderer, {
																				external: true,
																				variant: 'quiet-muted',
																				href: `${$.store_get($$store_subs ??= {}, '$regionalProtocol', regionalProtocol)}${proxyRule.domain}`,
																				children: ($$renderer) => {
																					if (Typography.Text) {
																						$$renderer.push('<!--[-->');

																						Typography.Text($$renderer, {
																							truncate: true,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(proxyRule.domain)}`);
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

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					direction: 'row',
																					gap: 's',
																					alignItems: 'center',
																					children: ($$renderer) => {
																						if (statusBadge) {
																							$$renderer.push('<!--[0-->');

																							Badge($$renderer, {
																								variant: 'secondary',
																								type: statusBadge.type,
																								content: statusBadge.content,
																								size: 'xs'
																							});
																						} else {
																							$$renderer.push('<!--[-1-->');
																						}

																						$$renderer.push(`<!--]--> `);

																						if (isRetryable) {
																							$$renderer.push('<!--[0-->');

																							Link($$renderer, {
																								size: 's',
																								variant: 'muted',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Retry`);
																								},
																								$$slots: { default: true }
																							});
																						} else {
																							$$renderer.push('<!--[-1-->');
																						}

																						$$renderer.push(`<!--]--> `);

																						if (isLogsViewable) {
																							$$renderer.push('<!--[0-->');

																							Link($$renderer, {
																								size: 's',
																								variant: 'muted',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->View logs`);
																								},
																								$$slots: { default: true }
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
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															} else if (column.id === 'target') {
																$$renderer.push(`<!--[1-->${$.escape(proxyTarget(proxyRule))}`);
															} else if (column.id === 'updated' && !isProxyRuleVerified(proxyRule.status)) {
																$$renderer.push('<!--[2-->');

																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		direction: 'row',
																		justifyContent: 'flex-end',
																		children: ($$renderer) => {
																			if (Typography.Text) {
																				$$renderer.push('<!--[-->');

																				Typography.Text($$renderer, {
																					variant: 'm-400',
																					color: '--fgcolor-neutral-tertiary',
																					style: 'font-size: 0.875rem;',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(updatedLabel(proxyRule))}`);
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
											}

											$$renderer.push(`<!--]--> `);

											if (Table.Cell) {
												$$renderer.push('<!--[-->');

												Table.Cell($$renderer, {
													column: 'actions',
													root,
													children: ($$renderer) => {
														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																direction: 'row',
																justifyContent: 'flex-end',
																children: ($$renderer) => {
																	Popover($$renderer, {
																		placement: 'bottom-start',
																		padding: 'none',
																		children: $.invalid_default_snippet,
																		$$slots: {
																			default: ($$renderer, { toggle }) => {
																				Button($$renderer, {
																					text: true,
																					icon: true,
																					children: ($$renderer) => {
																						Icon($$renderer, { icon: IconDotsHorizontal, size: 's' });
																					},
																					$$slots: { default: true }
																				});
																			},

																			tooltip: ($$renderer, { toggle }) => {
																				{
																					if (ActionMenu.Root) {
																						$$renderer.push('<!--[-->');

																						ActionMenu.Root($$renderer, {
																							children: ($$renderer) => {
																								if (isLogsViewable) {
																									$$renderer.push('<!--[0-->');

																									if (ActionMenu.Item.Button) {
																										$$renderer.push('<!--[-->');

																										ActionMenu.Item.Button($$renderer, {
																											leadingIcon: IconTerminal,
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->View logs`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}
																								} else {
																									$$renderer.push('<!--[-1-->');
																								}

																								$$renderer.push(`<!--]--> `);

																								if (isRetryable) {
																									$$renderer.push('<!--[0-->');

																									if (ActionMenu.Item.Button) {
																										$$renderer.push('<!--[-->');

																										ActionMenu.Item.Button($$renderer, {
																											leadingIcon: IconRefresh,
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Retry`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}
																								} else {
																									$$renderer.push('<!--[-1-->');
																								}

																								$$renderer.push(`<!--]--> `);
																								DnsRecordsAction($$renderer, { rule: proxyRule, organizationDomains });
																								$$renderer.push(`<!----> `);

																								if (isLogsViewable) {
																									$$renderer.push(`<!--[0--><div class="action-menu-divider svelte-11ubhyj">`);
																									Divider($$renderer, {});
																									$$renderer.push(`<!----></div>`);
																								} else {
																									$$renderer.push('<!--[-1-->');
																								}

																								$$renderer.push(`<!--]--> `);

																								if (ActionMenu.Item.Button) {
																									$$renderer.push('<!--[-->');

																									ActionMenu.Item.Button($$renderer, {
																										status: 'danger',
																										leadingIcon: IconTrash,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Delete`);
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
																			}
																		}
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
							}

							$$renderer.push(`<!--]-->`);
						},

						header: ($$renderer, { root }) => {
							{
								$$renderer.push(`<!--[-->`);

								const each_array_2 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

								for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
									let { id, title } = each_array_2[$$index];

									if (Table.Header.Cell) {
										$$renderer.push('<!--[-->');

										Table.Header.Cell($$renderer, {
											column: id,
											root,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(title)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(`<!--]--> `);

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

			$$renderer.push(` `);

			if (showDelete) {
				$$renderer.push('<!--[0-->');

				DeleteDomainModal($$renderer, {
					selectedProxyRule,
					get show() {
						return showDelete;
					},

					set show($$value) {
						showDelete = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showRetry) {
				$$renderer.push('<!--[0-->');

				RetryDomainModal($$renderer, {
					selectedProxyRule,
					domainsList: organizationDomains,
					get show() {
						return showRetry;
					},

					set show($$value) {
						showRetry = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showLogs) {
				$$renderer.push('<!--[0-->');

				ViewLogsModal($$renderer, {
					selectedProxyRule,
					domainsList: organizationDomains,
					get show() {
						return showLogs;
					},

					set show($$value) {
						showLogs = $$value;
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
	});
}
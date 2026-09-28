import * as $ from 'svelte/internal/server';
import { IconGlobeAlt } from '@appwrite.io/pink-icons-svelte';
import { Card, Divider, Fieldset, Icon, Layout, Tabs, Typography } from '@appwrite.io/pink-svelte';
import { Button, Form } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { goto, invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { isCloud } from '$lib/system';
import { page } from '$app/state';
import Wizard from '$lib/layout/wizard.svelte';
import { base } from '$app/paths';
import { writable } from 'svelte/store';
import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
import RecordTable from '$lib/components/domains/recordTable.svelte';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { getApexDomain } from '$lib/helpers/tlds.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		const ruleId = page.url.searchParams.get('rule');
		const showCNAMETab = $.derived(() => Boolean($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_CNAME) && $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_CNAME !== 'localhost');
		const showATab = $.derived(() => !isCloud && Boolean($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_A) && $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_A !== '127.0.0.1');
		const showAAAATab = $.derived(() => !isCloud && Boolean($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_AAAA) && $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_AAAA !== '::1');
		const showNSTab = isCloud;
		let proxyRule = $.derived(() => data.proxyRule);
		let selectedTab = getDefaultTab();
		const routeBase = `${base}/project-${page.params.region}-${page.params.project}/settings/domains`;
		let verified = undefined;
		const isSubmitting = writable(false);

		function getDefaultTab() {
			return showCNAMETab()
				? 'cname'
				: showATab() ? 'a' : showAAAATab() ? 'aaaa' : 'nameserver';
		}

		async function verify() {
			verified = undefined;

			try {
				const apexDomain = getApexDomain(proxyRule().domain);
				const domain = data.domainsList.domains.find((d) => d.domain === apexDomain);

				if (isCloud && domain) {
					await sdk.forConsole.domains.verifyNameservers({ domainId: domain.$id });
				}
			} catch(error) {
				// Ignore error
			}

			try {
				proxyRule(await sdk.forProject(page.params.region, page.params.project).proxy.updateRuleStatus({ ruleId }));
				await invalidate(Dependencies.DOMAINS);
				await goto(routeBase);
				addNotification({ type: 'success', message: 'Domain verified successfully' });
			} catch(error) {
				verified = false;
				isSubmitting.set(false);
				addNotification({ type: 'error', message: error.message });
			}
		}

		async function back() {
			if (ruleId) {
				await sdk.forProject(page.params.region, page.params.project).proxy.deleteRule({ ruleId });
			}

			await goto(`${routeBase}/add-domain?domain=${proxyRule().domain}`);
		}

		Wizard($$renderer, {
			title: 'Add domain',
			href: routeBase,
			column: true,
			columnSize: 's',
			children: ($$renderer) => {
				Form($$renderer, {
					onSubmit: verify,
					isSubmitting,
					children: ($$renderer) => {
						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								gap: 'xxl',
								children: ($$renderer) => {
									if (Card.Base) {
										$$renderer.push('<!--[-->');

										Card.Base($$renderer, {
											radius: 's',
											padding: 's',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														justifyContent: 'space-between',
														alignItems: 'center',
														gap: 'xs',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	direction: 'row',
																	alignItems: 'center',
																	gap: 'xs',
																	children: ($$renderer) => {
																		Icon($$renderer, { icon: IconGlobeAlt, color: '--fgcolor-neutral-primary' });
																		$$renderer.push(`<!----> `);

																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');

																			Typography.Text($$renderer, {
																				variation: 'm-500',
																				color: '--fgcolor-neutral-primary',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(proxyRule().domain)}`);
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

															Button($$renderer, {
																secondary: true,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Change`);
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

									$$renderer.push(` `);

									Fieldset($$renderer, {
										legend: 'Verification',
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													gap: 'xl',
													children: ($$renderer) => {
														$$renderer.push(`<div>`);

														if (Tabs.Root) {
															$$renderer.push('<!--[-->');

															Tabs.Root($$renderer, {
																variant: 'secondary',
																children: $.invalid_default_snippet,
																$$slots: {
																	default: ($$renderer, { root }) => {
																		if (showCNAMETab()) {
																			$$renderer.push('<!--[0-->');

																			if (Tabs.Item.Button) {
																				$$renderer.push('<!--[-->');

																				Tabs.Item.Button($$renderer, {
																					root,
																					active: selectedTab === 'cname',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->CNAME`);
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

																		if (showNSTab) {
																			$$renderer.push('<!--[0-->');

																			if (Tabs.Item.Button) {
																				$$renderer.push('<!--[-->');

																				Tabs.Item.Button($$renderer, {
																					root,
																					active: selectedTab === 'nameserver',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Nameservers`);
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

																		if (showATab()) {
																			$$renderer.push('<!--[0-->');

																			if (Tabs.Item.Button) {
																				$$renderer.push('<!--[-->');

																				Tabs.Item.Button($$renderer, {
																					root,
																					active: selectedTab === 'a',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->A`);
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

																		if (showAAAATab()) {
																			$$renderer.push('<!--[0-->');

																			if (Tabs.Item.Button) {
																				$$renderer.push('<!--[-->');

																				Tabs.Item.Button($$renderer, {
																					root,
																					active: selectedTab === 'aaaa',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->AAAA`);
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
																	}
																}
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);
														Divider($$renderer, {});
														$$renderer.push(`<!----></div> `);

														if (selectedTab === 'nameserver') {
															$$renderer.push('<!--[0-->');

															NameserverTable($$renderer, {
																verified,
																domain: proxyRule().domain,
																ruleStatus: proxyRule().status
															});
														} else {
															$$renderer.push('<!--[-1-->');

															RecordTable($$renderer, {
																verified,
																service: 'general',
																variant: selectedTab,
																domain: proxyRule().domain,
																ruleStatus: proxyRule().status,
																onNavigateToNameservers: () => selectedTab = 'nameserver',
																onNavigateToA: () => selectedTab = 'a',
																onNavigateToAAAA: () => selectedTab = 'aaaa'
															});
														}

														$$renderer.push(`<!--]--> `);
														Divider($$renderer, {});
														$$renderer.push(`<!----> `);

														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																direction: 'row',
																justifyContent: 'flex-end',
																children: ($$renderer) => {
																	$$renderer.push(`<div>`);

																	Button($$renderer, {
																		submit: true,
																		disabled: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Verify`);
																		},
																		$$slots: { default: true }
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
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
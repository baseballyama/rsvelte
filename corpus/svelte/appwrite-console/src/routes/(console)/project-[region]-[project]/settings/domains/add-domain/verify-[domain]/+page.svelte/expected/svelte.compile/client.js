import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<div><!> <!></div> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const $isSubmitting = () => $.store_get(isSubmitting, '$isSubmitting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const ruleId = page.url.searchParams.get('rule');
	const showCNAMETab = $.derived(() => Boolean($regionalConsoleVariables()._APP_DOMAIN_TARGET_CNAME) && $regionalConsoleVariables()._APP_DOMAIN_TARGET_CNAME !== 'localhost');
	const showATab = $.derived(() => !isCloud && Boolean($regionalConsoleVariables()._APP_DOMAIN_TARGET_A) && $regionalConsoleVariables()._APP_DOMAIN_TARGET_A !== '127.0.0.1');
	const showAAAATab = $.derived(() => !isCloud && Boolean($regionalConsoleVariables()._APP_DOMAIN_TARGET_AAAA) && $regionalConsoleVariables()._APP_DOMAIN_TARGET_AAAA !== '::1');
	const showNSTab = isCloud;
	let proxyRule = $.derived(() => $$props.data.proxyRule);
	let selectedTab = $.state($.proxy(getDefaultTab()));
	const routeBase = `${base}/project-${page.params.region}-${page.params.project}/settings/domains`;
	let verified = $.state(undefined);
	const isSubmitting = writable(false);

	function getDefaultTab() {
		return $.get(showCNAMETab)
			? 'cname'
			: $.get(showATab) ? 'a' : $.get(showAAAATab) ? 'aaaa' : 'nameserver';
	}

	async function verify() {
		$.set(verified, undefined);

		try {
			const apexDomain = getApexDomain($.get(proxyRule).domain);
			const domain = $$props.data.domainsList.domains.find((d) => d.domain === apexDomain);

			if (isCloud && domain) {
				await sdk.forConsole.domains.verifyNameservers({ domainId: domain.$id });
			}
		} catch(error) {
			// Ignore error
		}

		try {
			$.set(proxyRule, await sdk.forProject(page.params.region, page.params.project).proxy.updateRuleStatus({ ruleId }));
			await invalidate(Dependencies.DOMAINS);
			await goto(routeBase);
			addNotification({ type: 'success', message: 'Domain verified successfully' });
		} catch(error) {
			$.set(verified, false);
			isSubmitting.set(false);
			addNotification({ type: 'error', message: error.message });
		}
	}

	async function back() {
		if (ruleId) {
			await sdk.forProject(page.params.region, page.params.project).proxy.deleteRule({ ruleId });
		}

		await goto(`${routeBase}/add-domain?domain=${$.get(proxyRule).domain}`);
	}

	Wizard($$anchor, {
		title: 'Add domain',
		get href() {
			return routeBase;
		},
		column: true,
		columnSize: 's',
		children: ($$anchor, $$slotProps) => {
			Form($$anchor, {
				onSubmit: verify,
				get isSubmitting() {
					return isSubmitting;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							gap: 'xxl',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_1 = $.first_child(fragment_3);

								$.component(node_1, () => Card.Base, ($$anchor, Card_Base) => {
									Card_Base($$anchor, {
										radius: 's',
										padding: 's',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_2 = $.first_child(fragment_4);

											$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
												Layout_Stack_1($$anchor, {
													direction: 'row',
													justifyContent: 'space-between',
													alignItems: 'center',
													gap: 'xs',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_1();
														var node_3 = $.first_child(fragment_5);

														$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
															Layout_Stack_2($$anchor, {
																direction: 'row',
																alignItems: 'center',
																gap: 'xs',
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root_1();
																	var node_4 = $.first_child(fragment_6);

																	Icon(node_4, {
																		get icon() {
																			return IconGlobeAlt;
																		},
																		color: '--fgcolor-neutral-primary'
																	});

																	var node_5 = $.sibling(node_4, 2);

																	$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
																		Typography_Text($$anchor, {
																			variation: 'm-500',
																			color: '--fgcolor-neutral-primary',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text = $.text();

																				$.template_effect(() => $.set_text(text, $.get(proxyRule).domain));
																				$.append($$anchor, text);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															});
														});

														var node_6 = $.sibling(node_3, 2);

														Button(node_6, {
															secondary: true,
															$$events: { click: back },
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Change');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_7 = $.sibling(node_1, 2);

								Fieldset(node_7, {
									legend: 'Verification',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_8 = $.first_child(fragment_8);

										$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
											Layout_Stack_3($$anchor, {
												gap: 'xl',
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_4();
													var div = $.first_child(fragment_9);
													var node_9 = $.child(div);

													$.component(node_9, () => Tabs.Root, ($$anchor, Tabs_Root) => {
														Tabs_Root($$anchor, {
															variant: 'secondary',
															children: $.invalid_default_snippet,
															$$slots: {
																default: ($$anchor, $$slotProps) => {
																	const root = $.derived(() => $$slotProps.root);
																	var fragment_10 = root_2();
																	var node_10 = $.first_child(fragment_10);

																	{
																		var consequent = ($$anchor) => {
																			var fragment_11 = $.comment();
																			var node_11 = $.first_child(fragment_11);

																			{
																				let $0 = $.derived(() => $.get(selectedTab) === 'cname');

																				$.component(node_11, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button) => {
																					Tabs_Item_Button($$anchor, {
																						get root() {
																							return $.get(root);
																						},

																						get active() {
																							return $.get($0);
																						},
																						$$events: { click: () => $.set(selectedTab, 'cname') },
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_2 = $.text('CNAME');

																							$.append($$anchor, text_2);
																						},
																						$$slots: { default: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_11);
																		};

																		$.if(node_10, ($$render) => {
																			if ($.get(showCNAMETab)) $$render(consequent);
																		});
																	}

																	var node_12 = $.sibling(node_10, 2);

																	{
																		var consequent_1 = ($$anchor) => {
																			var fragment_12 = $.comment();
																			var node_13 = $.first_child(fragment_12);

																			{
																				let $0 = $.derived(() => $.get(selectedTab) === 'nameserver');

																				$.component(node_13, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button_1) => {
																					Tabs_Item_Button_1($$anchor, {
																						get root() {
																							return $.get(root);
																						},

																						get active() {
																							return $.get($0);
																						},
																						$$events: { click: () => $.set(selectedTab, 'nameserver') },
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_3 = $.text('Nameservers');

																							$.append($$anchor, text_3);
																						},
																						$$slots: { default: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_12);
																		};

																		$.if(node_12, ($$render) => {
																			if (showNSTab) $$render(consequent_1);
																		});
																	}

																	var node_14 = $.sibling(node_12, 2);

																	{
																		var consequent_2 = ($$anchor) => {
																			var fragment_13 = $.comment();
																			var node_15 = $.first_child(fragment_13);

																			{
																				let $0 = $.derived(() => $.get(selectedTab) === 'a');

																				$.component(node_15, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button_2) => {
																					Tabs_Item_Button_2($$anchor, {
																						get root() {
																							return $.get(root);
																						},

																						get active() {
																							return $.get($0);
																						},
																						$$events: { click: () => $.set(selectedTab, 'a') },
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_4 = $.text('A');

																							$.append($$anchor, text_4);
																						},
																						$$slots: { default: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_13);
																		};

																		$.if(node_14, ($$render) => {
																			if ($.get(showATab)) $$render(consequent_2);
																		});
																	}

																	var node_16 = $.sibling(node_14, 2);

																	{
																		var consequent_3 = ($$anchor) => {
																			var fragment_14 = $.comment();
																			var node_17 = $.first_child(fragment_14);

																			{
																				let $0 = $.derived(() => $.get(selectedTab) === 'aaaa');

																				$.component(node_17, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button_3) => {
																					Tabs_Item_Button_3($$anchor, {
																						get root() {
																							return $.get(root);
																						},

																						get active() {
																							return $.get($0);
																						},
																						$$events: { click: () => $.set(selectedTab, 'aaaa') },
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_5 = $.text('AAAA');

																							$.append($$anchor, text_5);
																						},
																						$$slots: { default: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_14);
																		};

																		$.if(node_16, ($$render) => {
																			if ($.get(showAAAATab)) $$render(consequent_3);
																		});
																	}

																	$.append($$anchor, fragment_10);
																}
															}
														});
													});

													var node_18 = $.sibling(node_9, 2);

													Divider(node_18, {});
													$.reset(div);

													var node_19 = $.sibling(div, 2);

													{
														var consequent_4 = ($$anchor) => {
															NameserverTable($$anchor, {
																get verified() {
																	return $.get(verified);
																},

																get domain() {
																	return $.get(proxyRule).domain;
																},

																get ruleStatus() {
																	return $.get(proxyRule).status;
																}
															});
														};

														var alternate = ($$anchor) => {
															RecordTable($$anchor, {
																get verified() {
																	return $.get(verified);
																},
																service: 'general',
																get variant() {
																	return $.get(selectedTab);
																},

																get domain() {
																	return $.get(proxyRule).domain;
																},

																get ruleStatus() {
																	return $.get(proxyRule).status;
																},
																onNavigateToNameservers: () => $.set(selectedTab, 'nameserver'),
																onNavigateToA: () => $.set(selectedTab, 'a'),
																onNavigateToAAAA: () => $.set(selectedTab, 'aaaa')
															});
														};

														$.if(node_19, ($$render) => {
															if ($.get(selectedTab) === 'nameserver') $$render(consequent_4); else $$render(alternate, -1);
														});
													}

													var node_20 = $.sibling(node_19, 2);

													Divider(node_20, {});

													var node_21 = $.sibling(node_20, 2);

													$.component(node_21, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
														Layout_Stack_4($$anchor, {
															direction: 'row',
															justifyContent: 'flex-end',
															children: ($$anchor, $$slotProps) => {
																var div_1 = root_3();
																var node_22 = $.child(div_1);

																Button(node_22, {
																	submit: true,
																	get disabled() {
																		return $isSubmitting();
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('Verify');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});

																$.reset(div_1);
																$.append($$anchor, div_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}
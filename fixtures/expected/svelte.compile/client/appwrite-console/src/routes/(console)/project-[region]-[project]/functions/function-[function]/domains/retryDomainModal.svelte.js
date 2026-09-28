import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { page } from '$app/state';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { isCloud } from '$lib/system';
import { Divider, Tabs } from '@appwrite.io/pink-svelte';
import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
import RecordTable from '$lib/components/domains/recordTable.svelte';
import { getApexDomain } from '$lib/helpers/tlds';

var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <!></div> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function RetryDomainModal($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let show = $.prop($$props, 'show', 15, false),
		selectedProxyRule = $.prop($$props, 'selectedProxyRule', 7);

	const showCNAMETab = $.derived(() => Boolean($regionalConsoleVariables()._APP_DOMAIN_TARGET_CNAME) && $regionalConsoleVariables()._APP_DOMAIN_TARGET_CNAME !== 'localhost');
	const showATab = $.derived(() => !isCloud && Boolean($regionalConsoleVariables()._APP_DOMAIN_TARGET_A) && $regionalConsoleVariables()._APP_DOMAIN_TARGET_A !== '127.0.0.1');
	const showAAAATab = $.derived(() => !isCloud && Boolean($regionalConsoleVariables()._APP_DOMAIN_TARGET_AAAA) && $regionalConsoleVariables()._APP_DOMAIN_TARGET_AAAA !== '::1');
	const showNSTab = isCloud;
	let selectedTab = $.state($.proxy(getDefaultTab()));
	let error = $.state(null);
	let verified = $.state(undefined);

	function getDefaultTab() {
		return $.get(showCNAMETab)
			? 'cname'
			: $.get(showATab) ? 'a' : $.get(showAAAATab) ? 'aaaa' : 'nameserver';
	}

	async function retryProxyRule() {
		$.set(error, null);
		$.set(verified, undefined);

		try {
			const apexDomain = getApexDomain(selectedProxyRule().domain);
			const domain = $$props.domainsList?.domains.find((d) => d.domain === apexDomain);

			if (isCloud && domain) {
				await sdk.forConsole.domains.verifyNameservers({ domainId: domain.$id });
			}
		} catch {
			// Ignore error
		}

		try {
			selectedProxyRule(await sdk.forProject(page.params.region, page.params.project).proxy.updateRuleStatus({ ruleId: selectedProxyRule().$id }));
			await invalidate(Dependencies.FUNCTION_DOMAINS);
			show(false);
			addNotification({ type: 'success', message: 'Domain verified successfully' });
			trackEvent(Submit.DomainUpdateVerification);
		} catch(e) {
			$.set(verified, false);
			$.set(error, e.message ?? 'Domain verification failed. Please check your domain settings or try again later', true);
			trackError(e, Submit.DomainUpdateVerification);
		}
	}

	$.user_effect(() => {
		if (!show()) {
			$.set(error, null);
		}
	});

	Modal($$anchor, {
		title: 'Retry verification',
		onSubmit: retryProxyRule,
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
				Tabs_Root($$anchor, {
					variant: 'secondary',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							const root = $.derived(() => $$slotProps.root);
							var fragment_2 = root_1();
							var node_1 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									{
										let $0 = $.derived(() => $.get(selectedTab) === 'cname');

										$.component(node_2, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button) => {
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

													var text = $.text('CNAME');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_3);
								};

								$.if(node_1, ($$render) => {
									if ($.get(showCNAMETab)) $$render(consequent);
								});
							}

							var node_3 = $.sibling(node_1, 2);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									{
										let $0 = $.derived(() => $.get(selectedTab) === 'nameserver');

										$.component(node_4, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button_1) => {
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

													var text_1 = $.text('Nameservers');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_4);
								};

								$.if(node_3, ($$render) => {
									if (showNSTab) $$render(consequent_1);
								});
							}

							var node_5 = $.sibling(node_3, 2);

							{
								var consequent_2 = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_6 = $.first_child(fragment_5);

									{
										let $0 = $.derived(() => $.get(selectedTab) === 'a');

										$.component(node_6, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button_2) => {
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

													var text_2 = $.text('A');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_5);
								};

								$.if(node_5, ($$render) => {
									if ($.get(showATab)) $$render(consequent_2);
								});
							}

							var node_7 = $.sibling(node_5, 2);

							{
								var consequent_3 = ($$anchor) => {
									var fragment_6 = $.comment();
									var node_8 = $.first_child(fragment_6);

									{
										let $0 = $.derived(() => $.get(selectedTab) === 'aaaa');

										$.component(node_8, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button_3) => {
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

													var text_3 = $.text('AAAA');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_6);
								};

								$.if(node_7, ($$render) => {
									if ($.get(showAAAATab)) $$render(consequent_3);
								});
							}

							$.append($$anchor, fragment_2);
						}
					}
				});
			});

			var node_9 = $.sibling(node, 2);

			Divider(node_9, {});
			$.reset(div);

			var node_10 = $.sibling(div, 2);

			{
				var consequent_4 = ($$anchor) => {
					NameserverTable($$anchor, {
						get verified() {
							return $.get(verified);
						},

						get domain() {
							return selectedProxyRule().domain;
						},

						get ruleStatus() {
							return selectedProxyRule().status;
						}
					});
				};

				var alternate = ($$anchor) => {
					RecordTable($$anchor, {
						get verified() {
							return $.get(verified);
						},
						service: 'functions',
						get variant() {
							return $.get(selectedTab);
						},

						get domain() {
							return selectedProxyRule().domain;
						},

						get ruleStatus() {
							return selectedProxyRule().status;
						},
						onNavigateToNameservers: () => $.set(selectedTab, 'nameserver'),
						onNavigateToA: () => $.set(selectedTab, 'a'),
						onNavigateToAAAA: () => $.set(selectedTab, 'aaaa')
					});
				};

				$.if(node_10, ($$render) => {
					if ($.get(selectedTab) === 'nameserver') $$render(consequent_4); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_9 = root_3();
				var node_11 = $.first_child(fragment_9);

				Button(node_11, {
					text: true,
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Cancel');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Button(node_12, {
					submit: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Retry');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_9);
			}
		}
	});

	$.pop();
	$$cleanup();
}
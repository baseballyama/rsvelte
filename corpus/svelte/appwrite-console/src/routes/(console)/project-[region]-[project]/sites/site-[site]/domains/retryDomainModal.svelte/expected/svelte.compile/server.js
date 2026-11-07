import * as $ from 'svelte/internal/server';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { Divider, Tabs } from '@appwrite.io/pink-svelte';
import { isCloud } from '$lib/system';
import { page } from '$app/state';
import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
import RecordTable from '$lib/components/domains/recordTable.svelte';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { getApexDomain } from '$lib/helpers/tlds';

export default function RetryDomainModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { show = false, selectedProxyRule, domainsList } = $$props;
		const showCNAMETab = $.derived(() => Boolean($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_SITES) && $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_SITES !== 'localhost');
		const showATab = $.derived(() => !isCloud && Boolean($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_A) && $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_A !== '127.0.0.1');
		const showAAAATab = $.derived(() => !isCloud && Boolean($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_AAAA) && $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_AAAA !== '::1');
		const showNSTab = isCloud;
		let selectedTab = getDefaultTab();
		let error = null;
		let verified = undefined;

		function getDefaultTab() {
			return showCNAMETab()
				? 'cname'
				: showATab() ? 'a' : showAAAATab() ? 'aaaa' : 'nameserver';
		}

		async function retryDomain() {
			error = null;
			verified = undefined;

			try {
				const apexDomain = getApexDomain(selectedProxyRule.domain);
				const domain = domainsList?.domains.find((d) => d.domain === apexDomain);

				if (isCloud && domain) {
					await sdk.forConsole.domains.verifyNameservers({ domainId: domain.$id });
				}
			} catch {
				// Ignore error
			}

			try {
				selectedProxyRule = await sdk.forProject(page.params.region, page.params.project).proxy.updateRuleStatus({ ruleId: selectedProxyRule.$id });
				await invalidate(Dependencies.SITES_DOMAINS);
				show = false;
				addNotification({ type: 'success', message: 'Domain verified successfully' });
				trackEvent(Submit.DomainUpdateVerification);
			} catch(e) {
				verified = false;
				error = e.message ?? 'Domain verification failed. Please check your domain settings or try again later';
				trackError(e, Submit.DomainUpdateVerification);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Retry verification',
				onSubmit: retryDomain,
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

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
							domain: selectedProxyRule.domain,
							ruleStatus: selectedProxyRule.status
						});
					} else {
						$$renderer.push('<!--[-1-->');

						RecordTable($$renderer, {
							verified,
							service: 'sites',
							variant: selectedTab,
							domain: selectedProxyRule.domain,
							ruleStatus: selectedProxyRule.status,
							onNavigateToNameservers: () => selectedTab = 'nameserver',
							onNavigateToA: () => selectedTab = 'a',
							onNavigateToAAAA: () => selectedTab = 'aaaa'
						});
					}

					$$renderer.push(`<!--]-->`);
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								text: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Retry`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { show });
	});
}
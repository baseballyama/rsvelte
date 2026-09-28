import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Container } from '$lib/layout';
import { Card, Divider, Empty, Layout, Tooltip } from '@appwrite.io/pink-svelte';
import SiteCard from '../(components)/siteCard.svelte';
import DomainsOverview from './domainsOverview.svelte';
import DeploymentsOverview from './deploymentsOverview.svelte';
import { Button } from '$lib/elements/forms';
import InstantRollbackDomain from './instantRollbackModal.svelte';
import { app } from '$lib/stores/app';
import { realtime } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { BODY_TOOLTIP_MAX_WIDTH, BODY_TOOLTIP_WRAPPER_STYLE } from '$lib/helpers/tooltipContent';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { base } from '$app/paths';
import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';

var root = $.from_html(`<div><!></div>`);

var root_1 = $.from_html(`<div slot="tooltip">Rollback is possible only if there is a deployment that is ready and was
                            active.</div>`);

var root_2 = $.from_html(`<!> <!>`, 1);

var root_3 = $.from_html(`<span slot="description">Your build is running. When it completes, this page will automatically
                        update with the latest deployment.</span>`);

var root_4 = $.from_html(`<span slot="description">Deploy your site to get started. Once deployed, you'll see your latest build
                        details here.</span>`);

var root_5 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $regionalProtocol = () => $.store_get(regionalProtocol, '$regionalProtocol', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showRollback = $.state(false);

	onMount(() => {
		return realtime.forConsole(page.params.region, 'console', (response) => {
			if (response.events.includes(`sites.${page.params.site}.deployments.*`)) {
				invalidate(Dependencies.SITE);
			}
		});
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 'xxxl',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_5();
						var node_2 = $.first_child(fragment_2);

						{
							var consequent_1 = ($$anchor) => {
								{
									const footer = ($$anchor) => {
										var fragment_4 = root_2();
										var node_3 = $.first_child(fragment_4);

										{
											var consequent = ($$anchor) => {
												{
													let $0 = $.derived(() => `${$regionalProtocol()}${$$props.data.proxyRuleList.rules[0]?.domain}`);

													Button($$anchor, {
														external: true,
														get href() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Visit');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												}
											};

											$.if(node_3, ($$render) => {
												if ($$props.data.proxyRuleList.total) $$render(consequent);
											});
										}

										var node_4 = $.sibling(node_3, 2);

										Tooltip(node_4, {
											get disabled() {
												return $$props.data.hasProdReadyDeployments;
											},

											get maxWidth() {
												return BODY_TOOLTIP_MAX_WIDTH;
											},

											children: ($$anchor, $$slotProps) => {
												var div = root();
												var node_5 = $.child(div);

												{
													let $0 = $.derived(() => !$$props.data.hasProdReadyDeployments);

													Button(node_5, {
														secondary: true,
														get disabled() {
															return $.get($0);
														},
														$$events: { click: () => $.set(showRollback, true) },
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Instant rollback');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												}

												$.reset(div);
												$.append($$anchor, div);
											},

											$$slots: {
												default: true,
												tooltip: ($$anchor, $$slotProps) => {
													var div_1 = root_1();

													$.template_effect(() => $.set_style(div_1, BODY_TOOLTIP_WRAPPER_STYLE));
													$.append($$anchor, div_1);
												}
											}
										});

										$.append($$anchor, fragment_4);
									};

									SiteCard($$anchor, {
										get site() {
											return $$props.data.site;
										},

										get deployment() {
											return $$props.data.deployment;
										},

										get proxyRuleList() {
											return $$props.data.proxyRuleList;
										},
										footer,
										$$slots: { footer: true }
									});
								}
							};

							var consequent_2 = ($$anchor) => {
								var fragment_6 = $.comment();
								var node_6 = $.first_child(fragment_6);

								$.component(node_6, () => Card.Base, ($$anchor, Card_Base) => {
									Card_Base($$anchor, {
										padding: 'none',
										children: ($$anchor, $$slotProps) => {
											{
												let $0 = $.derived(() => $app().themeInUse === 'dark'
													? `${base}/images/empty-deployment-dark.svg`
													: `${base}/images/empty-deployment-light.svg`);

												Empty($$anchor, {
													title: 'Deployment is still building',
													get src() {
														return $.get($0);
													},

													$$slots: {
														description: ($$anchor, $$slotProps) => {
															var span = root_3();

															$.append($$anchor, span);
														}
													}
												});
											}
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							};

							var alternate = ($$anchor) => {
								var fragment_8 = $.comment();
								var node_7 = $.first_child(fragment_8);

								$.component(node_7, () => Card.Base, ($$anchor, Card_Base_1) => {
									Card_Base_1($$anchor, {
										padding: 'none',
										children: ($$anchor, $$slotProps) => {
											{
												let $0 = $.derived(() => $app().themeInUse === 'dark'
													? `${base}/images/empty-deployment-dark.svg`
													: `${base}/images/empty-deployment-light.svg`);

												Empty($$anchor, {
													title: 'There is no active deployment',
													get src() {
														return $.get($0);
													},

													$$slots: {
														description: ($$anchor, $$slotProps) => {
															var span_1 = root_4();

															$.append($$anchor, span_1);
														}
													}
												});
											}
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_8);
							};

							$.if(node_2, ($$render) => {
								if ($$props.data?.deployment && $$props.data.deployment.status === 'ready') $$render(consequent_1); else if ($$props.data.deployment?.status === 'building') $$render(consequent_2, 1); else $$render(alternate, -1);
							});
						}

						var node_8 = $.sibling(node_2, 2);

						Divider(node_8, {});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => Layout.GridFraction, ($$anchor, Layout_GridFraction) => {
							Layout_GridFraction($$anchor, {
								gap: 'xxl',
								start: 1,
								end: 2,
								breakpoint: 'm',
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_2();
									var node_10 = $.first_child(fragment_10);

									DomainsOverview(node_10, {
										get proxyRuleList() {
											return $$props.data.proxyRuleList;
										}
									});

									var node_11 = $.sibling(node_10, 2);

									DeploymentsOverview(node_11, {
										get site() {
											return $$props.data.site;
										},

										get activeDeployment() {
											return $$props.data.deployment;
										},

										get deploymentList() {
											return $$props.data.deploymentList;
										}
									});

									$.append($$anchor, fragment_10);
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

	var node_12 = $.sibling(node, 2);

	{
		var consequent_3 = ($$anchor) => {
			InstantRollbackDomain($$anchor, {
				get deployment() {
					return $$props.data.deployment;
				},

				get proxyRuleList() {
					return $$props.data.proxyRuleList;
				},

				get prodReadyDeployments() {
					return $$props.data.prodReadyDeployments;
				},

				get show() {
					return $.get(showRollback);
				},

				set show($$value) {
					$.set(showRollback, $$value, true);
				}
			});
		};

		$.if(node_12, ($$render) => {
			if ($.get(showRollback)) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
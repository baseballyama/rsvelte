import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let showRollback = false;

		onMount(() => {
			return realtime.forConsole(page.params.region, 'console', (response) => {
				if (response.events.includes(`sites.${page.params.site}.deployments.*`)) {
					invalidate(Dependencies.SITE);
				}
			});
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'xxxl',
							children: ($$renderer) => {
								if (data?.deployment && data.deployment.status === 'ready') {
									$$renderer.push('<!--[0-->');

									{
										function footer($$renderer) {
											if (data.proxyRuleList.total) {
												$$renderer.push('<!--[0-->');

												Button($$renderer, {
													external: true,
													href: `${$.store_get($$store_subs ??= {}, '$regionalProtocol', regionalProtocol)}${data.proxyRuleList.rules[0]?.domain}`,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Visit`);
													},
													$$slots: { default: true }
												});
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> `);

											Tooltip($$renderer, {
												disabled: data.hasProdReadyDeployments,
												maxWidth: BODY_TOOLTIP_MAX_WIDTH,
												children: ($$renderer) => {
													$$renderer.push(`<div>`);

													Button($$renderer, {
														secondary: true,
														disabled: !data.hasProdReadyDeployments,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Instant rollback`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div>`);
												},

												$$slots: {
													default: true,
													tooltip: ($$renderer) => {
														$$renderer.push(`<div slot="tooltip"${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE)}>Rollback is possible only if there is a deployment that is ready and was
                            active.</div>`);
													}
												}
											});

											$$renderer.push(`<!---->`);
										}

										SiteCard($$renderer, {
											site: data.site,
											deployment: data.deployment,
											proxyRuleList: data.proxyRuleList,
											footer,
											$$slots: { footer: true }
										});
									}
								} else if (data.deployment?.status === 'building') {
									$$renderer.push('<!--[1-->');

									if (Card.Base) {
										$$renderer.push('<!--[-->');

										Card.Base($$renderer, {
											padding: 'none',
											children: ($$renderer) => {
												Empty($$renderer, {
													title: 'Deployment is still building',
													src: $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark'
														? `${base}/images/empty-deployment-dark.svg`
														: `${base}/images/empty-deployment-light.svg`,

													$$slots: {
														description: ($$renderer) => {
															$$renderer.push(`<span slot="description">Your build is running. When it completes, this page will automatically
                        update with the latest deployment.</span>`);
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
								} else {
									$$renderer.push('<!--[-1-->');

									if (Card.Base) {
										$$renderer.push('<!--[-->');

										Card.Base($$renderer, {
											padding: 'none',
											children: ($$renderer) => {
												Empty($$renderer, {
													title: 'There is no active deployment',
													src: $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark'
														? `${base}/images/empty-deployment-dark.svg`
														: `${base}/images/empty-deployment-light.svg`,

													$$slots: {
														description: ($$renderer) => {
															$$renderer.push(`<span slot="description">Deploy your site to get started. Once deployed, you'll see your latest build
                        details here.</span>`);
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
								}

								$$renderer.push(`<!--]--> `);
								Divider($$renderer, {});
								$$renderer.push(`<!----> `);

								if (Layout.GridFraction) {
									$$renderer.push('<!--[-->');

									Layout.GridFraction($$renderer, {
										gap: 'xxl',
										start: 1,
										end: 2,
										breakpoint: 'm',
										children: ($$renderer) => {
											DomainsOverview($$renderer, { proxyRuleList: data.proxyRuleList });
											$$renderer.push(`<!----> `);

											DeploymentsOverview($$renderer, {
												site: data.site,
												activeDeployment: data.deployment,
												deploymentList: data.deploymentList
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
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (showRollback) {
				$$renderer.push('<!--[0-->');

				InstantRollbackDomain($$renderer, {
					deployment: data.deployment,
					proxyRuleList: data.proxyRuleList,
					prodReadyDeployments: data.prodReadyDeployments,
					get show() {
						return showRollback;
					},

					set show($$value) {
						showRollback = $$value;
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
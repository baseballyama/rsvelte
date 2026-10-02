import * as $ from 'svelte/internal/server';
import { Container } from '$lib/layout';
import { realtime } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import SiteCard from '../../../(components)/siteCard.svelte';
import Logs, { badgeTypeDeployment } from '../../../(components)/logs.svelte';
import Card from '$lib/components/card.svelte';
import { Button } from '$lib/elements/forms';
import DeploymentActionMenu from '../../../(components)/deploymentActionMenu.svelte';
import DeleteDeploymentModal from '../deleteDeploymentModal.svelte';
import CancelDeploymentModal from '../cancelDeploymentModal.svelte';
import RedeployModal from '../../../redeployModal.svelte';
import ActivateDeploymentModal from '../../../activateDeploymentModal.svelte';
import { Accordion, Tooltip } from '@appwrite.io/pink-svelte';
import { capitalize } from '$lib/helpers/string';
import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import LogsTimer from '../../../(components)/logsTimer.svelte';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { page } from '$app/state';
import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let deployment = $.derived(() => data.deployment);
		let effectiveStatus = $.derived(() => getEffectiveBuildStatus(deployment(), $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)));
		let showRedeploy = false;
		let showActivate = false;
		let showDelete = false;
		let showCancel = false;

		onMount(() => {
			return realtime.forConsole(page.params.region, 'console', async (response) => {
				if (response.events.includes(`sites.${page.params.site}.deployments.${page.params.deployment}.update`)) {
					await invalidate(Dependencies.DEPLOYMENT);
				}
			});
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					{
						function footer($$renderer) {
							if (effectiveStatus() === 'ready' && data.proxyRuleList?.total) {
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
								disabled: deployment()?.sourceSize !== 0,
								placement: 'bottom',
								children: ($$renderer) => {
									$$renderer.push(`<div>`);

									Button($$renderer, {
										secondary: true,
										disabled: deployment()?.sourceSize === 0,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Redeploy`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div>`);
								},

								$$slots: {
									default: true,
									tooltip: ($$renderer) => {
										$$renderer.push(`<div slot="tooltip">Source is empty</div>`);
									}
								}
							});

							$$renderer.push(`<!----> `);

							DeploymentActionMenu($$renderer, {
								inCard: true,
								deployment: deployment(),
								selectedDeployment: deployment(),
								activeDeployment: data.site.deploymentId,
								get showRedeploy() {
									return showRedeploy;
								},

								set showRedeploy($$value) {
									showRedeploy = $$value;
									$$settled = false;
								},

								get showActivate() {
									return showActivate;
								},

								set showActivate($$value) {
									showActivate = $$value;
									$$settled = false;
								},

								get showDelete() {
									return showDelete;
								},

								set showDelete($$value) {
									showDelete = $$value;
									$$settled = false;
								},

								get showCancel() {
									return showCancel;
								},

								set showCancel($$value) {
									showCancel = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						}

						SiteCard($$renderer, {
							deployment: deployment(),
							proxyRuleList: data.proxyRuleList,
							footer,
							$$slots: { footer: true }
						});
					}

					$$renderer.push(`<!----> `);

					Card($$renderer, {
						padding: 's',
						children: ($$renderer) => {
							Accordion($$renderer, {
								title: 'Deployment logs',
								badge: capitalize(effectiveStatus()),
								open: true,
								badgeType: badgeTypeDeployment(effectiveStatus()),
								hideDivider: true,
								children: ($$renderer) => {
									Logs($$renderer, { deployment: deployment(), hideTitle: true, fullHeight: true });
								},

								$$slots: {
									default: true,
									end: ($$renderer) => {
										{
											LogsTimer($$renderer, { deployment: deployment() });
										}
									}
								}
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (showDelete) {
				$$renderer.push('<!--[0-->');

				DeleteDeploymentModal($$renderer, {
					selectedDeployment: deployment(),
					activeDeployment: data.site?.deploymentId,
					get showDelete() {
						return showDelete;
					},

					set showDelete($$value) {
						showDelete = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			CancelDeploymentModal($$renderer, {
				selectedDeployment: deployment(),
				get showCancel() {
					return showCancel;
				},

				set showCancel($$value) {
					showCancel = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RedeployModal($$renderer, {
				selectedDeploymentId: deployment().$id,
				redirect: true,
				site: data.site,
				get show() {
					return showRedeploy;
				},

				set show($$value) {
					showRedeploy = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (showActivate) {
				$$renderer.push('<!--[0-->');

				ActivateDeploymentModal($$renderer, {
					siteId: data.site.$id,
					selectedDeploymentId: deployment().$id,
					get show() {
						return showActivate;
					},

					set show($$value) {
						showActivate = $$value;
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
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div slot="tooltip">Source is empty</div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const $regionalProtocol = () => $.store_get(regionalProtocol, '$regionalProtocol', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let deployment = $.derived(() => $$props.data.deployment);
	let effectiveStatus = $.derived(() => getEffectiveBuildStatus($.get(deployment), $regionalConsoleVariables()));
	let showRedeploy = $.state(false);
	let showActivate = $.state(false);
	let showDelete = $.state(false);
	let showCancel = $.state(false);

	onMount(() => {
		return realtime.forConsole(page.params.region, 'console', async (response) => {
			if (response.events.includes(`sites.${page.params.site}.deployments.${page.params.deployment}.update`)) {
				await invalidate(Dependencies.DEPLOYMENT);
			}
		});
	});

	var fragment = root_4();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node_1 = $.first_child(fragment_1);

			{
				const footer = ($$anchor) => {
					var fragment_2 = root_2();
					var node_2 = $.first_child(fragment_2);

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

						$.if(node_2, ($$render) => {
							if ($.get(effectiveStatus) === 'ready' && $$props.data.proxyRuleList?.total) $$render(consequent);
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => $.get(deployment)?.sourceSize !== 0);

						Tooltip(node_3, {
							get disabled() {
								return $.get($0);
							},
							placement: 'bottom',
							children: ($$anchor, $$slotProps) => {
								var div = root();
								var node_4 = $.child(div);

								{
									let $0 = $.derived(() => $.get(deployment)?.sourceSize === 0);

									Button(node_4, {
										secondary: true,
										get disabled() {
											return $.get($0);
										},
										$$events: { click: () => $.set(showRedeploy, true) },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Redeploy');

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

									$.append($$anchor, div_1);
								}
							}
						});
					}

					var node_5 = $.sibling(node_3, 2);

					DeploymentActionMenu(node_5, {
						inCard: true,
						get deployment() {
							return $.get(deployment);
						},

						get selectedDeployment() {
							return $.get(deployment);
						},

						get activeDeployment() {
							return $$props.data.site.deploymentId;
						},

						get showRedeploy() {
							return $.get(showRedeploy);
						},

						set showRedeploy($$value) {
							$.set(showRedeploy, $$value, true);
						},

						get showActivate() {
							return $.get(showActivate);
						},

						set showActivate($$value) {
							$.set(showActivate, $$value, true);
						},

						get showDelete() {
							return $.get(showDelete);
						},

						set showDelete($$value) {
							$.set(showDelete, $$value, true);
						},

						get showCancel() {
							return $.get(showCancel);
						},

						set showCancel($$value) {
							$.set(showCancel, $$value, true);
						}
					});

					$.append($$anchor, fragment_2);
				};

				SiteCard(node_1, {
					get deployment() {
						return $.get(deployment);
					},

					get proxyRuleList() {
						return $$props.data.proxyRuleList;
					},
					footer,
					$$slots: { footer: true }
				});
			}

			var node_6 = $.sibling(node_1, 2);

			Card(node_6, {
				padding: 's',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => capitalize($.get(effectiveStatus)));
						let $1 = $.derived(() => badgeTypeDeployment($.get(effectiveStatus)));

						Accordion($$anchor, {
							title: 'Deployment logs',
							get badge() {
								return $.get($0);
							},
							open: true,
							get badgeType() {
								return $.get($1);
							},
							hideDivider: true,
							children: ($$anchor, $$slotProps) => {
								Logs($$anchor, {
									get deployment() {
										return $.get(deployment);
									},
									hideTitle: true,
									fullHeight: true
								});
							},

							$$slots: {
								default: true,
								end: ($$anchor, $$slotProps) => {
									LogsTimer($$anchor, {
										get deployment() {
											return $.get(deployment);
										}
									});
								}
							}
						});
					}
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => $$props.data.site?.deploymentId);

				DeleteDeploymentModal($$anchor, {
					get selectedDeployment() {
						return $.get(deployment);
					},

					get activeDeployment() {
						return $.get($0);
					},

					get showDelete() {
						return $.get(showDelete);
					},

					set showDelete($$value) {
						$.set(showDelete, $$value, true);
					}
				});
			}
		};

		$.if(node_7, ($$render) => {
			if ($.get(showDelete)) $$render(consequent_1);
		});
	}

	var node_8 = $.sibling(node_7, 2);

	CancelDeploymentModal(node_8, {
		get selectedDeployment() {
			return $.get(deployment);
		},

		get showCancel() {
			return $.get(showCancel);
		},

		set showCancel($$value) {
			$.set(showCancel, $$value, true);
		}
	});

	var node_9 = $.sibling(node_8, 2);

	RedeployModal(node_9, {
		get selectedDeploymentId() {
			return $.get(deployment).$id;
		},
		redirect: true,
		get site() {
			return $$props.data.site;
		},

		get show() {
			return $.get(showRedeploy);
		},

		set show($$value) {
			$.set(showRedeploy, $$value, true);
		}
	});

	var node_10 = $.sibling(node_9, 2);

	{
		var consequent_2 = ($$anchor) => {
			ActivateDeploymentModal($$anchor, {
				get siteId() {
					return $$props.data.site.$id;
				},

				get selectedDeploymentId() {
					return $.get(deployment).$id;
				},

				get show() {
					return $.get(showActivate);
				},

				set show($$value) {
					$.set(showActivate, $$value, true);
				}
			});
		};

		$.if(node_10, ($$render) => {
			if ($.get(showActivate)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
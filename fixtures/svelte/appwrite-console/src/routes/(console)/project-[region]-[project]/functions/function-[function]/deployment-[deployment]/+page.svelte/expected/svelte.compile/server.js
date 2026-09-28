import * as $ from 'svelte/internal/server';
import { Button } from '$lib/elements/forms';
import { Container } from '$lib/layout';
import { realtime } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import Activate from '../(modals)/activateModal.svelte';
import Cancel from '../(modals)/cancelDeploymentModal.svelte';
import DeploymentCard from '../(components)/deploymentCard.svelte';
import Delete from '../(modals)/deleteModal.svelte';

import {
	Accordion,
	ActionMenu,
	Card,
	Icon,
	Layout,
	Logs,
	Spinner,
	Tooltip,
	Typography
} from '@appwrite.io/pink-svelte';

import { capitalize } from '$lib/helpers/string';
import { formatTimeDetailed } from '$lib/helpers/timeConversion';
import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { timer } from '$lib/actions/timer';
import { app } from '$lib/stores/app';
import { IconDotsHorizontal, IconRefresh, IconTrash } from '@appwrite.io/pink-icons-svelte';
import { Menu } from '$lib/components/menu';
import { canWriteFunctions } from '$lib/stores/roles';
import { Click, trackEvent } from '$lib/actions/analytics';
import DownloadActionMenuItem from '../(components)/downloadActionMenuItem.svelte';
import { base } from '$app/paths';
import { isCloud } from '$lib/system';
import { readOnly } from '$lib/stores/billing';
import RedeployModal from '../(modals)/redeployModal.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		const effectiveStatus = $.derived(() => getEffectiveBuildStatus(data.deployment, $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)));
		const displayStatus = $.derived(() => effectiveStatus() === 'finalizing' ? 'ready' : effectiveStatus());
		let showDelete = false;
		let showCancel = false;
		let showActivate = false;
		let showRedeploy = false;

		onMount(() => {
			return realtime.forConsole(page.params.region, 'console', (message) => {
				if (message.events.includes(`functions.${page.params.function}.deployments.${page.params.deployment}.update`)) {
					const payload = message.payload;

					if (['ready', 'failed'].includes(payload.status)) {
						invalidate(Dependencies.DEPLOYMENT);
					}
				}
			});
		});

		function badgeTypeDeployment(status) {
			switch (status) {
				case 'failed':
					return 'error';

				case 'ready':
					return 'success';

				case 'building':
					return 'warning';

				case 'processing':
					return undefined;

				default:
					return undefined;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					{
						function footer($$renderer) {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									alignItems: 'center',
									inline: true,
									children: ($$renderer) => {
										if (effectiveStatus() === 'processing' || effectiveStatus() === 'building' || effectiveStatus() === 'waiting') {
											$$renderer.push('<!--[0-->');

											Button($$renderer, {
												text: true,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Cancel`);
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										Menu($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													secondary: true,
													icon: true,
													text: true,
													children: ($$renderer) => {
														Icon($$renderer, { icon: IconDotsHorizontal });
													},
													$$slots: { default: true }
												});
											},

											$$slots: {
												default: true,
												menu: ($$renderer, { toggle }) => {
													{
														if (ActionMenu.Root) {
															$$renderer.push('<!--[-->');

															ActionMenu.Root($$renderer, {
																children: ($$renderer) => {
																	if ($.store_get($$store_subs ??= {}, '$canWriteFunctions', canWriteFunctions)) {
																		$$renderer.push('<!--[0-->');

																		Tooltip($$renderer, {
																			disabled: data.deployment.sourceSize !== 0,
																			placement: 'bottom',
																			children: ($$renderer) => {
																				$$renderer.push(`<div>`);

																				if (ActionMenu.Item.Button) {
																					$$renderer.push('<!--[-->');

																					ActionMenu.Item.Button($$renderer, {
																						leadingIcon: IconRefresh,
																						disabled: data.deployment.sourceSize === 0,
																						style: 'width: 100%',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Redeploy`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(`</div>`);
																			},

																			$$slots: {
																				default: true,
																				tooltip: ($$renderer) => {
																					$$renderer.push(`<div slot="tooltip">Source is empty</div>`);
																				}
																			}
																		});
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]--> `);

																	if (!!data.deployment?.sourceSize || !!data.deployment?.sourceSize) {
																		$$renderer.push('<!--[0-->');
																		DownloadActionMenuItem($$renderer, { deployment: data.deployment, toggle });
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]--> `);

																	if ($.store_get($$store_subs ??= {}, '$canWriteFunctions', canWriteFunctions) && ['ready', 'failed'].includes(data.deployment.status)) {
																		$$renderer.push('<!--[0-->');

																		if (ActionMenu.Item.Button) {
																			$$renderer.push('<!--[-->');

																			ActionMenu.Item.Button($$renderer, {
																				status: 'danger',
																				leadingIcon: IconTrash,
																				style: 'width: 100%',
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
												}
											}
										});

										$$renderer.push(`<!----> `);

										if (data.func.deploymentId === data.deployment.$id && data.deployment.status === 'ready') {
											$$renderer.push('<!--[0-->');

											Button($$renderer, {
												href: `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/executions/execute-function`,
												disabled: isCloud && $.store_get($$store_subs ??= {}, '$readOnly', readOnly),
												children: ($$renderer) => {
													$$renderer.push(`<!---->Execute`);
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (data.func.deploymentId !== data.deployment.$id && data.deployment.status === 'ready') {
											$$renderer.push('<!--[0-->');

											Button($$renderer, {
												disabled: data.activeDeployment,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Activate`);
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
						}

						DeploymentCard($$renderer, {
							proxyRuleList: data.proxyRuleList,
							deployment: data.deployment,
							footer,
							$$slots: { footer: true }
						});
					}

					$$renderer.push(`<!----> `);

					if (Card.Base) {
						$$renderer.push('<!--[-->');

						Card.Base($$renderer, {
							padding: 's',
							children: ($$renderer) => {
								Accordion($$renderer, {
									title: 'Deployment logs',
									badge: capitalize(displayStatus()),
									open: true,
									badgeType: badgeTypeDeployment(displayStatus()),
									hideDivider: true,
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 'xl',
												children: ($$renderer) => {
													$$renderer.push(`<!---->`);

													{
														Logs($$renderer, {
															showScrollButton: true,
															logs: data.deployment.buildLogs || 'No logs available yet...',
															get theme() {
																return $.store_get($$store_subs ??= {}, '$app', app).themeInUse;
															},

															set theme($$value) {
																$.store_mutate($$store_subs ??= {}, '$app', app, $.store_get($$store_subs ??= {}, '$app', app).themeInUse = $$value);
																$$settled = false;
															}
														});
													}

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

									$$slots: {
										default: true,
										end: ($$renderer) => {
											{
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														alignItems: 'center',
														inline: true,
														children: ($$renderer) => {
															if (['processing', 'building'].includes(effectiveStatus())) {
																$$renderer.push('<!--[0-->');

																if (Typography.Code) {
																	$$renderer.push('<!--[-->');

																	Typography.Code($$renderer, {
																		color: '--fgcolor-neutral-secondary',
																		children: ($$renderer) => {
																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					direction: 'row',
																					alignItems: 'center',
																					inline: true,
																					children: ($$renderer) => {
																						$$renderer.push(`<p></p> `);
																						Spinner($$renderer, { size: 's' });
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
															} else {
																$$renderer.push('<!--[-1-->');

																if (Typography.Code) {
																	$$renderer.push('<!--[-->');

																	Typography.Code($$renderer, {
																		color: '--fgcolor-neutral-secondary',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(formatTimeDetailed(data.deployment.buildDuration))}`);
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

			$$renderer.push(`<!----> `);

			Delete($$renderer, {
				selectedDeployment: data.deployment,
				get showDelete() {
					return showDelete;
				},

				set showDelete($$value) {
					showDelete = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Cancel($$renderer, {
				selectedDeployment: data.deployment,
				get showCancel() {
					return showCancel;
				},

				set showCancel($$value) {
					showCancel = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Activate($$renderer, {
				selectedDeployment: data.deployment,
				get showActivate() {
					return showActivate;
				},

				set showActivate($$value) {
					showActivate = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (showRedeploy) {
				$$renderer.push('<!--[0-->');

				RedeployModal($$renderer, {
					selectedDeployment: data.deployment,
					redirect: true,
					get show() {
						return showRedeploy;
					},

					set show($$value) {
						showRedeploy = $$value;
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

		$.bind_props($$props, { badgeTypeDeployment });
	});
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div slot="tooltip">Source is empty</div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<p></p> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const $canWriteFunctions = () => $.store_get(canWriteFunctions, '$canWriteFunctions', $$stores);
	const $readOnly = () => $.store_get(readOnly, '$readOnly', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const effectiveStatus = $.derived(() => getEffectiveBuildStatus($$props.data.deployment, $regionalConsoleVariables()));
	const displayStatus = $.derived(() => $.get(effectiveStatus) === 'finalizing' ? 'ready' : $.get(effectiveStatus));
	let showDelete = $.state(false);
	let showCancel = $.state(false);
	let showActivate = $.state(false);
	let showRedeploy = $.state(false);

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

	var $$exports = { badgeTypeDeployment };
	var fragment = root_6();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var node_1 = $.first_child(fragment_1);

			{
				const footer = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							direction: 'row',
							alignItems: 'center',
							inline: true,
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_3();
								var node_3 = $.first_child(fragment_3);

								{
									var consequent = ($$anchor) => {
										Button($$anchor, {
											text: true,
											$$events: {
												click: () => {
													$.set(showCancel, true);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Cancel');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									};

									$.if(node_3, ($$render) => {
										if ($.get(effectiveStatus) === 'processing' || $.get(effectiveStatus) === 'building' || $.get(effectiveStatus) === 'waiting') $$render(consequent);
									});
								}

								var node_4 = $.sibling(node_3, 2);

								Menu(node_4, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											secondary: true,
											icon: true,
											text: true,
											children: ($$anchor, $$slotProps) => {
												Icon($$anchor, {
													get icon() {
														return IconDotsHorizontal;
													}
												});
											},
											$$slots: { default: true }
										});
									},

									$$slots: {
										default: true,
										menu: ($$anchor, $$slotProps) => {
											const toggle = $.derived(() => $$slotProps.toggle);
											var fragment_7 = $.comment();
											var node_5 = $.first_child(fragment_7);

											$.component(node_5, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
												ActionMenu_Root($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root_2();
														var node_6 = $.first_child(fragment_8);

														{
															var consequent_1 = ($$anchor) => {
																{
																	let $0 = $.derived(() => $$props.data.deployment.sourceSize !== 0);

																	Tooltip($$anchor, {
																		get disabled() {
																			return $.get($0);
																		},
																		placement: 'bottom',
																		children: ($$anchor, $$slotProps) => {
																			var div = root();
																			var node_7 = $.child(div);

																			{
																				let $0 = $.derived(() => $$props.data.deployment.sourceSize === 0);

																				$.component(node_7, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																					ActionMenu_Item_Button($$anchor, {
																						get leadingIcon() {
																							return IconRefresh;
																						},

																						get disabled() {
																							return $.get($0);
																						},
																						style: 'width: 100%',
																						$$events: {
																							click: () => {
																								$.set(showRedeploy, true);
																								trackEvent(Click.FunctionsRedeployClick);
																								$.get(toggle)();
																							}
																						},

																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_1 = $.text('Redeploy');

																							$.append($$anchor, text_1);
																						},
																						$$slots: { default: true }
																					});
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
															};

															$.if(node_6, ($$render) => {
																if ($canWriteFunctions()) $$render(consequent_1);
															});
														}

														var node_8 = $.sibling(node_6, 2);

														{
															var consequent_2 = ($$anchor) => {
																DownloadActionMenuItem($$anchor, {
																	get deployment() {
																		return $$props.data.deployment;
																	},

																	get toggle() {
																		return $.get(toggle);
																	}
																});
															};

															$.if(node_8, ($$render) => {
																if (!!$$props.data.deployment?.sourceSize || !!$$props.data.deployment?.sourceSize) $$render(consequent_2);
															});
														}

														var node_9 = $.sibling(node_8, 2);

														{
															var consequent_3 = ($$anchor) => {
																var fragment_11 = $.comment();
																var node_10 = $.first_child(fragment_11);

																$.component(node_10, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_1) => {
																	ActionMenu_Item_Button_1($$anchor, {
																		status: 'danger',
																		get leadingIcon() {
																			return IconTrash;
																		},
																		style: 'width: 100%',
																		$$events: {
																			click: () => {
																				$.set(showDelete, true);
																				$.get(toggle)();
																			}
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('Delete');

																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_11);
															};

															var d = $.derived(() => $canWriteFunctions() && ['ready', 'failed'].includes($$props.data.deployment.status));

															$.if(node_9, ($$render) => {
																if ($.get(d)) $$render(consequent_3);
															});
														}

														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
										}
									}
								});

								var node_11 = $.sibling(node_4, 2);

								{
									var consequent_4 = ($$anchor) => {
										{
											let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/executions/execute-function`);
											let $1 = $.derived(() => isCloud && $readOnly());

											Button($$anchor, {
												get href() {
													return $.get($0);
												},

												get disabled() {
													return $.get($1);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Execute');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										}
									};

									$.if(node_11, ($$render) => {
										if ($$props.data.func.deploymentId === $$props.data.deployment.$id && $$props.data.deployment.status === 'ready') $$render(consequent_4);
									});
								}

								var node_12 = $.sibling(node_11, 2);

								{
									var consequent_5 = ($$anchor) => {
										Button($$anchor, {
											get disabled() {
												return $$props.data.activeDeployment;
											},

											$$events: {
												click: () => {
													$.set(showActivate, true);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Activate');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									};

									$.if(node_12, ($$render) => {
										if ($$props.data.func.deploymentId !== $$props.data.deployment.$id && $$props.data.deployment.status === 'ready') $$render(consequent_5);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				DeploymentCard(node_1, {
					get proxyRuleList() {
						return $$props.data.proxyRuleList;
					},

					get deployment() {
						return $$props.data.deployment;
					},
					footer,
					$$slots: { footer: true }
				});
			}

			var node_13 = $.sibling(node_1, 2);

			$.component(node_13, () => Card.Base, ($$anchor, Card_Base) => {
				Card_Base($$anchor, {
					padding: 's',
					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => capitalize($.get(displayStatus)));
							let $1 = $.derived(() => badgeTypeDeployment($.get(displayStatus)));

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
									var fragment_15 = $.comment();
									var node_14 = $.first_child(fragment_15);

									$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											gap: 'xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = $.comment();
												var node_15 = $.first_child(fragment_16);

												$.key(node_15, () => $$props.data.deployment.buildLogs, ($$anchor) => {
													{
														let $0 = $.derived(() => $$props.data.deployment.buildLogs || 'No logs available yet...');

														Logs($$anchor, {
															showScrollButton: true,
															get logs() {
																return $.get($0);
															},

															get theme() {
																return $app().themeInUse;
															},

															set theme($$value) {
																$.store_mutate(app, $.untrack($app).themeInUse = $$value, $.untrack($app));
															}
														});
													}
												});

												$.append($$anchor, fragment_16);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_15);
								},

								$$slots: {
									default: true,
									end: ($$anchor, $$slotProps) => {
										var fragment_18 = $.comment();
										var node_16 = $.first_child(fragment_18);

										$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
											Layout_Stack_2($$anchor, {
												direction: 'row',
												alignItems: 'center',
												inline: true,
												children: ($$anchor, $$slotProps) => {
													var fragment_19 = $.comment();
													var node_17 = $.first_child(fragment_19);

													{
														var consequent_6 = ($$anchor) => {
															var fragment_20 = $.comment();
															var node_18 = $.first_child(fragment_20);

															$.component(node_18, () => Typography.Code, ($$anchor, Typography_Code) => {
																Typography_Code($$anchor, {
																	color: '--fgcolor-neutral-secondary',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_21 = $.comment();
																		var node_19 = $.first_child(fragment_21);

																		$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																			Layout_Stack_3($$anchor, {
																				direction: 'row',
																				alignItems: 'center',
																				inline: true,
																				children: ($$anchor, $$slotProps) => {
																					var fragment_22 = root_4();
																					var p = $.first_child(fragment_22);

																					$.action(p, ($$node, $$action_arg) => timer?.($$node, $$action_arg), () => ({ start: $$props.data.deployment.$createdAt }));

																					var node_20 = $.sibling(p, 2);

																					Spinner(node_20, { size: 's' });
																					$.append($$anchor, fragment_22);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_21);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_20);
														};

														var d_1 = $.derived(() => ['processing', 'building'].includes($.get(effectiveStatus)));

														var alternate = ($$anchor) => {
															var fragment_23 = $.comment();
															var node_21 = $.first_child(fragment_23);

															$.component(node_21, () => Typography.Code, ($$anchor, Typography_Code_1) => {
																Typography_Code_1($$anchor, {
																	color: '--fgcolor-neutral-secondary',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text();

																		$.template_effect(($0) => $.set_text(text_5, $0), [
																			() => formatTimeDetailed($$props.data.deployment.buildDuration)
																		]);

																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_23);
														};

														$.if(node_17, ($$render) => {
															if ($.get(d_1)) $$render(consequent_6); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_19);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_18);
									}
								}
							});
						}
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node, 2);

	Delete(node_22, {
		get selectedDeployment() {
			return $$props.data.deployment;
		},

		get showDelete() {
			return $.get(showDelete);
		},

		set showDelete($$value) {
			$.set(showDelete, $$value, true);
		}
	});

	var node_23 = $.sibling(node_22, 2);

	Cancel(node_23, {
		get selectedDeployment() {
			return $$props.data.deployment;
		},

		get showCancel() {
			return $.get(showCancel);
		},

		set showCancel($$value) {
			$.set(showCancel, $$value, true);
		}
	});

	var node_24 = $.sibling(node_23, 2);

	Activate(node_24, {
		get selectedDeployment() {
			return $$props.data.deployment;
		},

		get showActivate() {
			return $.get(showActivate);
		},

		set showActivate($$value) {
			$.set(showActivate, $$value, true);
		},
		$$events: { activated: () => invalidate(Dependencies.DEPLOYMENTS) }
	});

	var node_25 = $.sibling(node_24, 2);

	{
		var consequent_7 = ($$anchor) => {
			RedeployModal($$anchor, {
				get selectedDeployment() {
					return $$props.data.deployment;
				},
				redirect: true,
				get show() {
					return $.get(showRedeploy);
				},

				set show($$value) {
					$.set(showRedeploy, $$value, true);
				}
			});
		};

		$.if(node_25, ($$render) => {
			if ($.get(showRedeploy)) $$render(consequent_7);
		});
	}

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Id, MultiSelectionTable } from '$lib/components';
import { formatTimeDetailed } from '$lib/helpers/timeConversion';
import { timer } from '$lib/actions/timer';
import { calculateSize } from '$lib/helpers/sizeConvertion';
import { func } from './store';
import { page } from '$app/state';
import Activate from './(modals)/activateModal.svelte';
import RedeployModal from './(modals)/redeployModal.svelte';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import Cancel from './(modals)/cancelDeploymentModal.svelte';
import { base } from '$app/paths';
import { ActionMenu, Icon, Status, Table, Tooltip } from '@appwrite.io/pink-svelte';
import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';

import {
	IconDotsHorizontal,
	IconLightningBolt,
	IconRefresh,
	IconTrash,
	IconXCircle
} from '@appwrite.io/pink-icons-svelte';

import { Button } from '$lib/elements/forms';
import { DeploymentCreatedBy, DeploymentSource } from '$lib/components/git';
import Delete from './(modals)/deleteModal.svelte';
import { capitalize } from '$lib/helpers/string';
import { deploymentStatusConverter } from '$lib/stores/git';
import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import DownloadActionMenuItem from './(components)/downloadActionMenuItem.svelte';
import { Menu } from '$lib/components/menu';
import { sdk } from '$lib/stores/sdk';

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span></span>`);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<div slot="tooltip">Source is empty</div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<p>Are you sure you want to delete <strong> </strong> <strong> </strong>?</p>`);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const $func = () => $.store_get(func, '$func', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showDelete = $.state(false);
	let showCancel = $.state(false);
	let showActivate = $.state(false);
	let showRedeploy = $.state(false);
	let selectedDeployment = $.state(null);

	function handleActivate() {
		invalidate(Dependencies.DEPLOYMENTS);
	}

	async function deleteDeployments(batchDelete) {
		const result = await batchDelete((deploymentId) => sdk.forProject(page.params.region, page.params.project).functions.deleteDeployment({ functionId: page.params.function, deploymentId }));

		try {
			if (result.error) {
				trackError(result.error, Submit.DeploymentDelete);
			} else {
				trackEvent(Submit.DeploymentDelete, { total: result.deleted.length });
			}
		} finally {
			await invalidate(Dependencies.DEPLOYMENTS);
		}

		return result;
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		const header = ($$anchor, root = $.noop) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => $$props.columns, $.index, ($$anchor, $$item) => {
				let id = () => $.get($$item).id;
				let title = () => $.get($$item).title;
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
					Table_Header_Cell($$anchor, {
						get column() {
							return id();
						},

						get root() {
							return root();
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, title()));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			var node_3 = $.sibling(node_1, 2);

			$.component(node_3, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
				Table_Header_Cell_1($$anchor, {
					column: 'actions',
					get root() {
						return root();
					}
				});
			});

			$.append($$anchor, fragment_1);
		};

		const children = ($$anchor, root = $.noop) => {
			var fragment_4 = $.comment();
			var node_4 = $.first_child(fragment_4);

			$.each(node_4, 17, () => $$props.data.deploymentList.deployments, (deployment) => deployment.$id, ($$anchor, deployment) => {
				const effectiveStatus = $.derived(() => getEffectiveBuildStatus($.get(deployment), $regionalConsoleVariables()));
				const displayStatus = $.derived(() => $.get(effectiveStatus) === 'finalizing' ? 'ready' : $.get(effectiveStatus));
				var fragment_5 = $.comment();
				var node_5 = $.first_child(fragment_5);

				{
					let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/deployment-${$.get(deployment).$id}`);

					$.component(node_5, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
						Table_Row_Link($$anchor, {
							get root() {
								return root();
							},

							get id() {
								return $.get(deployment).$id;
							},

							get href() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_6 = $.first_child(fragment_6);

								$.each(node_6, 17, () => $$props.columns, $.index, ($$anchor, column) => {
									var fragment_7 = $.comment();
									var node_7 = $.first_child(fragment_7);

									$.component(node_7, () => Table.Cell, ($$anchor, Table_Cell) => {
										Table_Cell($$anchor, {
											get column() {
												return $.get(column).id;
											},

											get root() {
												return root();
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_8 = $.comment();
												var node_8 = $.first_child(fragment_8);

												{
													var consequent = ($$anchor) => {
														var fragment_9 = $.comment();
														var node_9 = $.first_child(fragment_9);

														$.key(node_9, () => $.get(column).id, ($$anchor) => {
															Id($$anchor, {
																get value() {
																	return $.get(deployment).$id;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text();

																	$.template_effect(() => $.set_text(text_1, $.get(deployment).$id));
																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_9);
													};

													var consequent_2 = ($$anchor) => {
														var fragment_12 = $.comment();
														var node_10 = $.first_child(fragment_12);

														{
															var consequent_1 = ($$anchor) => {
																Status($$anchor, { status: 'complete', label: 'Active' });
															};

															var alternate = ($$anchor) => {
																{
																	let $0 = $.derived(() => deploymentStatusConverter($.get(displayStatus)));
																	let $1 = $.derived(() => capitalize($.get(displayStatus)));

																	Status($$anchor, {
																		get status() {
																			return $.get($0);
																		},

																		get label() {
																			return $.get($1);
																		}
																	});
																}
															};

															$.if(node_10, ($$render) => {
																if ($$props.data?.activeDeployment?.$id === $.get(deployment)?.$id) $$render(consequent_1); else $$render(alternate, -1);
															});
														}

														$.append($$anchor, fragment_12);
													};

													var consequent_3 = ($$anchor) => {
														DeploymentSource($$anchor, {
															get deployment() {
																return $.get(deployment);
															}
														});
													};

													var consequent_4 = ($$anchor) => {
														DeploymentCreatedBy($$anchor, {
															get deployment() {
																return $.get(deployment);
															}
														});
													};

													var consequent_7 = ($$anchor) => {
														var fragment_17 = $.comment();
														var node_11 = $.first_child(fragment_17);

														{
															var consequent_5 = ($$anchor) => {
																var text_2 = $.text('-');

																$.append($$anchor, text_2);
															};

															var d = $.derived(() => ['waiting'].includes($.get(effectiveStatus)));

															var consequent_6 = ($$anchor) => {
																var span = root_2();

																$.action(span, ($$node, $$action_arg) => timer?.($$node, $$action_arg), () => ({ start: $.get(deployment).$createdAt }));
																$.append($$anchor, span);
															};

															var d_1 = $.derived(() => ['processing', 'building'].includes($.get(effectiveStatus)));

															var alternate_1 = ($$anchor) => {
																var text_3 = $.text();

																$.template_effect(($0) => $.set_text(text_3, $0), [() => formatTimeDetailed($.get(deployment).buildDuration)]);
																$.append($$anchor, text_3);
															};

															$.if(node_11, ($$render) => {
																if ($.get(d)) $$render(consequent_5); else if ($.get(d_1)) $$render(consequent_6, 1); else $$render(alternate_1, -1);
															});
														}

														$.append($$anchor, fragment_17);
													};

													var consequent_8 = ($$anchor) => {
														var text_4 = $.text();

														$.template_effect(($0) => $.set_text(text_4, $0), [() => calculateSize($.get(deployment).totalSize)]);
														$.append($$anchor, text_4);
													};

													var consequent_9 = ($$anchor) => {
														var text_5 = $.text();

														$.template_effect(($0) => $.set_text(text_5, $0), [() => calculateSize($.get(deployment).sourceSize)]);
														$.append($$anchor, text_5);
													};

													var consequent_10 = ($$anchor) => {
														var text_6 = $.text();

														$.template_effect(($0) => $.set_text(text_6, $0), [() => calculateSize($.get(deployment).buildSize)]);
														$.append($$anchor, text_6);
													};

													$.if(node_8, ($$render) => {
														if ($.get(column).id === '$id') $$render(consequent); else if ($.get(column).id === 'status') $$render(consequent_2, 1); else if ($.get(column).id === 'type') $$render(consequent_3, 2); else if ($.get(column).id === '$updatedAt') $$render(consequent_4, 3); else if ($.get(column).id === 'buildDuration') $$render(consequent_7, 4); else if ($.get(column).id === 'totalSize') $$render(consequent_8, 5); else if ($.get(column).id === 'sourceSize') $$render(consequent_9, 6); else if ($.get(column).id === 'buildSize') $$render(consequent_10, 7);
													});
												}

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								});

								var node_12 = $.sibling(node_6, 2);

								$.component(node_12, () => Table.Cell, ($$anchor, Table_Cell_1) => {
									Table_Cell_1($$anchor, {
										column: 'actions',
										get root() {
											return root();
										},

										children: ($$anchor, $$slotProps) => {
											Menu($$anchor, {
												children: ($$anchor, $$slotProps) => {
													Button($$anchor, {
														text: true,
														icon: true,
														size: 's',
														children: ($$anchor, $$slotProps) => {
															Icon($$anchor, {
																size: 's',
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
														var fragment_25 = $.comment();
														var node_13 = $.first_child(fragment_25);

														$.component(node_13, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
															ActionMenu_Root($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_26 = root_5();
																	var node_14 = $.first_child(fragment_26);

																	{
																		let $0 = $.derived(() => $.get(deployment).sourceSize !== 0);

																		Tooltip(node_14, {
																			get disabled() {
																				return $.get($0);
																			},
																			placement: 'bottom',
																			children: ($$anchor, $$slotProps) => {
																				var div = root_3();
																				var node_15 = $.child(div);

																				{
																					let $0 = $.derived(() => $.get(deployment).sourceSize === 0);

																					$.component(node_15, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
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
																									$.set(selectedDeployment, $.get(deployment), true);
																									$.set(showRedeploy, true);
																									$.get(toggle)();
																									trackEvent(Click.FunctionsRedeployClick);
																								}
																							},

																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_7 = $.text('Redeploy');

																								$.append($$anchor, text_7);
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
																					var div_1 = root_4();

																					$.append($$anchor, div_1);
																				}
																			}
																		});
																	}

																	var node_16 = $.sibling(node_14, 2);

																	{
																		var consequent_11 = ($$anchor) => {
																			var fragment_27 = $.comment();
																			var node_17 = $.first_child(fragment_27);

																			$.component(node_17, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_1) => {
																				ActionMenu_Item_Button_1($$anchor, {
																					get leadingIcon() {
																						return IconLightningBolt;
																					},

																					$$events: {
																						click: () => {
																							$.set(selectedDeployment, $.get(deployment), true);
																							$.set(showActivate, true);
																							$.get(toggle)();
																						}
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_8 = $.text('Activate');

																						$.append($$anchor, text_8);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_27);
																		};

																		$.if(node_16, ($$render) => {
																			if ($.get(deployment).status === 'ready' && $.get(deployment).$id !== $func().deploymentId) $$render(consequent_11);
																		});
																	}

																	var node_18 = $.sibling(node_16, 2);

																	DownloadActionMenuItem(node_18, {
																		get deployment() {
																			return $.get(deployment);
																		},

																		get toggle() {
																			return $.get(toggle);
																		}
																	});

																	var node_19 = $.sibling(node_18, 2);

																	{
																		var consequent_12 = ($$anchor) => {
																			var fragment_28 = $.comment();
																			var node_20 = $.first_child(fragment_28);

																			$.component(node_20, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_2) => {
																				ActionMenu_Item_Button_2($$anchor, {
																					get trailingIcon() {
																						return IconXCircle;
																					},

																					$$events: {
																						click: () => {
																							$.set(selectedDeployment, $.get(deployment), true);
																							$.get(toggle)();
																							$.set(showCancel, true);
																							trackEvent(Click.FunctionsDeploymentCancelClick);
																						}
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_9 = $.text('Cancel');

																						$.append($$anchor, text_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_28);
																		};

																		$.if(node_19, ($$render) => {
																			if ($.get(effectiveStatus) === 'processing' || $.get(effectiveStatus) === 'building' || $.get(effectiveStatus) === 'waiting') $$render(consequent_12);
																		});
																	}

																	var node_21 = $.sibling(node_19, 2);

																	{
																		var consequent_13 = ($$anchor) => {
																			var fragment_29 = $.comment();
																			var node_22 = $.first_child(fragment_29);

																			$.component(node_22, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_3) => {
																				ActionMenu_Item_Button_3($$anchor, {
																					get leadingIcon() {
																						return IconTrash;
																					},
																					status: 'danger',
																					$$events: {
																						click: () => {
																							$.set(selectedDeployment, $.get(deployment), true);
																							$.get(toggle)();
																							$.set(showDelete, true);
																							trackEvent(Click.FunctionsDeploymentDeleteClick);
																						}
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_10 = $.text('Delete');

																						$.append($$anchor, text_10);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_29);
																		};

																		$.if(node_21, ($$render) => {
																			if ($.get(effectiveStatus) !== 'building' && $.get(effectiveStatus) !== 'processing' && $.get(effectiveStatus) !== 'waiting') $$render(consequent_13);
																		});
																	}

																	$.append($$anchor, fragment_26);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_25);
													}
												}
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_5);
			});

			$.append($$anchor, fragment_4);
		};

		const deleteContent = ($$anchor, count = $.noop) => {
			var p = root_6();
			var strong = $.sibling($.child(p));
			var text_11 = $.only_child(strong, true);
			var text_12 = $.sibling(strong);
			var strong_1 = $.sibling(text_12);
			var text_13 = $.only_child(strong_1, true);

			$.next();
			$.reset(p);

			$.template_effect(() => {
				$.set_text(text_11, count());
				$.set_text(text_12, ` ${count() > 1 ? 'deployments' : 'deployment'} from your function - `);
				$.set_text(text_13, page.data.function.name);
			});

			$.append($$anchor, p);
		};

		let $0 = $.derived(() => [...$$props.columns, { id: 'actions', width: 40 }]);

		MultiSelectionTable(node, {
			allowSelection: true,
			resource: 'deployment',
			onDelete: deleteDeployments,
			get columns() {
				return $.get($0);
			},
			header,
			children,
			deleteContent,
			$$slots: { header: true, default: true, deleteContent: true }
		});
	}

	var node_23 = $.sibling(node, 2);

	{
		var consequent_14 = ($$anchor) => {
			var fragment_30 = root_7();
			var node_24 = $.first_child(fragment_30);

			Delete(node_24, {
				get selectedDeployment() {
					return $.get(selectedDeployment);
				},

				get showDelete() {
					return $.get(showDelete);
				},

				set showDelete($$value) {
					$.set(showDelete, $$value, true);
				}
			});

			var node_25 = $.sibling(node_24, 2);

			Cancel(node_25, {
				get selectedDeployment() {
					return $.get(selectedDeployment);
				},

				get showCancel() {
					return $.get(showCancel);
				},

				set showCancel($$value) {
					$.set(showCancel, $$value, true);
				}
			});

			var node_26 = $.sibling(node_25, 2);

			RedeployModal(node_26, {
				get selectedDeployment() {
					return $.get(selectedDeployment);
				},

				get show() {
					return $.get(showRedeploy);
				},

				set show($$value) {
					$.set(showRedeploy, $$value, true);
				}
			});

			var node_27 = $.sibling(node_26, 2);

			Activate(node_27, {
				get selectedDeployment() {
					return $.get(selectedDeployment);
				},

				get showActivate() {
					return $.get(showActivate);
				},

				set showActivate($$value) {
					$.set(showActivate, $$value, true);
				},
				$$events: { activated: handleActivate }
			});

			$.append($$anchor, fragment_30);
		};

		$.if(node_23, ($$render) => {
			if ($.get(selectedDeployment)) $$render(consequent_14);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
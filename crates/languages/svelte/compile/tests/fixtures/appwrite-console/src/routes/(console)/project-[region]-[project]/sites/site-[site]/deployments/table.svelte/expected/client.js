import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Id, MultiSelectionTable } from '$lib/components';
import { formatTimeDetailed } from '$lib/helpers/timeConversion';
import { DeploymentSource, DeploymentCreatedBy } from '$lib/components/git';
import { timer } from '$lib/actions/timer';
import { calculateSize } from '$lib/helpers/sizeConvertion';
import { page } from '$app/state';
import Delete from './deleteDeploymentModal.svelte';
import RedeployModal from '../../redeployModal.svelte';
import Cancel from './cancelDeploymentModal.svelte';
import { base } from '$app/paths';
import { Layout, Status, Table } from '@appwrite.io/pink-svelte';
import { columns } from './store';
import ActivateDeploymentModal from '../../activateDeploymentModal.svelte';
import { capitalize } from '$lib/helpers/string';
import DeploymentActionMenu from '../../(components)/deploymentActionMenu.svelte';
import { deploymentStatusConverter } from '$lib/stores/git';
import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span></span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showDelete = $.state(false);
	let showActivate = $.state(false);
	let showRedeploy = $.state(false);
	let showCancel = $.state(false);
	let selectedDeployment = $.state(null);

	async function deleteDeployments(batchDelete) {
		const result = await batchDelete((deploymentId) => sdk.forProject(page.params.region, page.params.project).sites.deleteDeployment({ siteId: page.params.site, deploymentId }));

		try {
			if (result.error) {
				trackError(result.error, Submit.DeploymentDelete);
			} else {
				trackEvent(Submit.DeploymentDelete, { total: result.deleted.length });
			}
		} finally {
			await Promise.all([
				invalidate(Dependencies.DEPLOYMENTS),
				invalidate(Dependencies.SITE)
			]);
		}

		return result;
	}

	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		const header = ($$anchor, root = $.noop) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 1, $columns, $.index, ($$anchor, $$item) => {
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
					let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/deployments/deployment-${$.get(deployment).$id}`);

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

								$.each(node_6, 1, $columns, $.index, ($$anchor, column) => {
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

														$.template_effect(($0) => $.set_text(text_4, $0), [() => calculateSize($.get(deployment)?.totalSize ?? 0)]);
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
											var fragment_22 = $.comment();
											var node_13 = $.first_child(fragment_22);

											$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack) => {
												Layout_Stack($$anchor, {
													alignItems: 'flex-end',
													children: ($$anchor, $$slotProps) => {
														DeploymentActionMenu($$anchor, {
															get deployment() {
																return $.get(deployment);
															},

															get activeDeployment() {
																return $$props.data.site.deploymentId;
															},

															get selectedDeployment() {
																return $.get(selectedDeployment);
															},

															set selectedDeployment($$value) {
																$.set(selectedDeployment, $$value, true);
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
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_22);
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

		let $0 = $.derived(() => [...$columns(), { id: 'actions', width: 40 }]);

		MultiSelectionTable(node, {
			resource: 'deployment',
			onDelete: deleteDeployments,
			get columns() {
				return $.get($0);
			},
			header,
			children,
			$$slots: { header: true, default: true }
		});
	}

	var node_14 = $.sibling(node, 2);

	{
		var consequent_11 = ($$anchor) => {
			var fragment_24 = root_3();
			var node_15 = $.first_child(fragment_24);

			Delete(node_15, {
				get selectedDeployment() {
					return $.get(selectedDeployment);
				},

				get activeDeployment() {
					return $$props.data.site.deploymentId;
				},

				get showDelete() {
					return $.get(showDelete);
				},

				set showDelete($$value) {
					$.set(showDelete, $$value, true);
				}
			});

			var node_16 = $.sibling(node_15, 2);

			Cancel(node_16, {
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

			var node_17 = $.sibling(node_16, 2);

			RedeployModal(node_17, {
				get selectedDeploymentId() {
					return $.get(selectedDeployment).$id;
				},

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

			$.append($$anchor, fragment_24);
		};

		$.if(node_14, ($$render) => {
			if ($.get(selectedDeployment)) $$render(consequent_11);
		});
	}

	var node_18 = $.sibling(node_14, 2);

	{
		var consequent_12 = ($$anchor) => {
			ActivateDeploymentModal($$anchor, {
				get siteId() {
					return $$props.data.site.$id;
				},

				get selectedDeploymentId() {
					return $.get(selectedDeployment).$id;
				},

				get show() {
					return $.get(showActivate);
				},

				set show($$value) {
					$.set(showActivate, $$value, true);
				}
			});
		};

		$.if(node_18, ($$render) => {
			if ($.get(selectedDeployment) && $.get(showActivate)) $$render(consequent_12);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
import * as $ from 'svelte/internal/server';
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

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, columns } = $$props;
		let showDelete = false;
		let showCancel = false;
		let showActivate = false;
		let showRedeploy = false;
		let selectedDeployment = null;

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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function header($$renderer, root) {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(columns);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let { id, title } = each_array[$$index];

						if (Table.Header.Cell) {
							$$renderer.push('<!--[-->');

							Table.Header.Cell($$renderer, {
								column: id,
								root,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(title)}`);
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

					if (Table.Header.Cell) {
						$$renderer.push('<!--[-->');
						Table.Header.Cell($$renderer, { column: 'actions', root });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				function children($$renderer, root) {
					$$renderer.push(`<!--[-->`);

					const each_array_1 = $.ensure_array_like(data.deploymentList.deployments);

					for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
						let deployment = each_array_1[$$index_2];
						const effectiveStatus = getEffectiveBuildStatus(deployment, $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables));
						const displayStatus = effectiveStatus === 'finalizing' ? 'ready' : effectiveStatus;

						if (Table.Row.Link) {
							$$renderer.push('<!--[-->');

							Table.Row.Link($$renderer, {
								root,
								id: deployment.$id,
								href: `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/deployment-${deployment.$id}`,
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_2 = $.ensure_array_like(columns);

									for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
										let column = each_array_2[$$index_1];

										if (Table.Cell) {
											$$renderer.push('<!--[-->');

											Table.Cell($$renderer, {
												column: column.id,
												root,
												children: ($$renderer) => {
													if (column.id === '$id') {
														$$renderer.push(`<!--[0--><!---->`);

														{
															Id($$renderer, {
																value: deployment.$id,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(deployment.$id)}`);
																},
																$$slots: { default: true }
															});
														}

														$$renderer.push(`<!---->`);
													} else if (column.id === 'status') {
														$$renderer.push('<!--[1-->');

														if (data?.activeDeployment?.$id === deployment?.$id) {
															$$renderer.push('<!--[0-->');
															Status($$renderer, { status: 'complete', label: 'Active' });
														} else {
															$$renderer.push('<!--[-1-->');

															Status($$renderer, {
																status: deploymentStatusConverter(displayStatus),
																label: capitalize(displayStatus)
															});
														}

														$$renderer.push(`<!--]-->`);
													} else if (column.id === 'type') {
														$$renderer.push('<!--[2-->');
														DeploymentSource($$renderer, { deployment });
													} else if (column.id === '$updatedAt') {
														$$renderer.push('<!--[3-->');
														DeploymentCreatedBy($$renderer, { deployment });
													} else if (column.id === 'buildDuration') {
														$$renderer.push('<!--[4-->');

														if (['waiting'].includes(effectiveStatus)) {
															$$renderer.push(`<!--[0-->-`);
														} else if (['processing', 'building'].includes(effectiveStatus)) {
															$$renderer.push(`<!--[1--><span></span>`);
														} else {
															$$renderer.push(`<!--[-1-->${$.escape(formatTimeDetailed(deployment.buildDuration))}`);
														}

														$$renderer.push(`<!--]-->`);
													} else if (column.id === 'totalSize') {
														$$renderer.push(`<!--[5-->${$.escape(calculateSize(deployment.totalSize))}`);
													} else if (column.id === 'sourceSize') {
														$$renderer.push(`<!--[6-->${$.escape(calculateSize(deployment.sourceSize))}`);
													} else if (column.id === 'buildSize') {
														$$renderer.push(`<!--[7-->${$.escape(calculateSize(deployment.buildSize))}`);
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

									$$renderer.push(`<!--]--> `);

									if (Table.Cell) {
										$$renderer.push('<!--[-->');

										Table.Cell($$renderer, {
											column: 'actions',
											root,
											children: ($$renderer) => {
												Menu($$renderer, {
													children: ($$renderer) => {
														Button($$renderer, {
															text: true,
															icon: true,
															size: 's',
															children: ($$renderer) => {
																Icon($$renderer, { size: 's', icon: IconDotsHorizontal });
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
																			Tooltip($$renderer, {
																				disabled: deployment.sourceSize !== 0,
																				placement: 'bottom',
																				children: ($$renderer) => {
																					$$renderer.push(`<div>`);

																					if (ActionMenu.Item.Button) {
																						$$renderer.push('<!--[-->');

																						ActionMenu.Item.Button($$renderer, {
																							leadingIcon: IconRefresh,
																							disabled: deployment.sourceSize === 0,
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

																			$$renderer.push(`<!----> `);

																			if (deployment.status === 'ready' && deployment.$id !== $.store_get($$store_subs ??= {}, '$func', func).deploymentId) {
																				$$renderer.push('<!--[0-->');

																				if (ActionMenu.Item.Button) {
																					$$renderer.push('<!--[-->');

																					ActionMenu.Item.Button($$renderer, {
																						leadingIcon: IconLightningBolt,
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Activate`);
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
																			DownloadActionMenuItem($$renderer, { deployment, toggle });
																			$$renderer.push(`<!----> `);

																			if (effectiveStatus === 'processing' || effectiveStatus === 'building' || effectiveStatus === 'waiting') {
																				$$renderer.push('<!--[0-->');

																				if (ActionMenu.Item.Button) {
																					$$renderer.push('<!--[-->');

																					ActionMenu.Item.Button($$renderer, {
																						trailingIcon: IconXCircle,
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Cancel`);
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

																			if (effectiveStatus !== 'building' && effectiveStatus !== 'processing' && effectiveStatus !== 'waiting') {
																				$$renderer.push('<!--[0-->');

																				if (ActionMenu.Item.Button) {
																					$$renderer.push('<!--[-->');

																					ActionMenu.Item.Button($$renderer, {
																						leadingIcon: IconTrash,
																						status: 'danger',
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
					}

					$$renderer.push(`<!--]-->`);
				}

				function deleteContent($$renderer, count) {
					$$renderer.push(`<p>Are you sure you want to delete <strong>${$.escape(count)}</strong> ${$.escape(count > 1 ? 'deployments' : 'deployment')} from your function - <strong>${$.escape(page.data.function.name)}</strong>?</p>`);
				}

				MultiSelectionTable($$renderer, {
					allowSelection: true,
					resource: 'deployment',
					onDelete: deleteDeployments,
					columns: [...columns, { id: 'actions', width: 40 }],
					header,
					children,
					deleteContent,
					$$slots: { header: true, default: true, deleteContent: true }
				});
			}

			$$renderer.push(`<!----> `);

			if (selectedDeployment) {
				$$renderer.push('<!--[0-->');

				Delete($$renderer, {
					selectedDeployment,
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
					selectedDeployment,
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
					selectedDeployment,
					get show() {
						return showRedeploy;
					},

					set show($$value) {
						showRedeploy = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Activate($$renderer, {
					selectedDeployment,
					get showActivate() {
						return showActivate;
					},

					set showActivate($$value) {
						showActivate = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
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
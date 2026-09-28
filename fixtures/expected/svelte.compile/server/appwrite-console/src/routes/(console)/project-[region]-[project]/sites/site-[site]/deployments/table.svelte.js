import * as $ from 'svelte/internal/server';
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

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		let showDelete = false;
		let showActivate = false;
		let showRedeploy = false;
		let showCancel = false;
		let selectedDeployment = null;

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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function header($$renderer, root) {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

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
								href: `${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/deployments/deployment-${deployment.$id}`,
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_2 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

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
														$$renderer.push(`<!--[5-->${$.escape(calculateSize(deployment?.totalSize ?? 0))}`);
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
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														alignItems: 'flex-end',
														children: ($$renderer) => {
															DeploymentActionMenu($$renderer, {
																deployment,
																activeDeployment: data.site.deploymentId,
																get selectedDeployment() {
																	return selectedDeployment;
																},

																set selectedDeployment($$value) {
																	selectedDeployment = $$value;
																	$$settled = false;
																},

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

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				}

				MultiSelectionTable($$renderer, {
					resource: 'deployment',
					onDelete: deleteDeployments,
					columns: [
						...$.store_get($$store_subs ??= {}, '$columns', columns),
						{ id: 'actions', width: 40 }
					],
					header,
					children,
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			if (selectedDeployment) {
				$$renderer.push('<!--[0-->');

				Delete($$renderer, {
					selectedDeployment,
					activeDeployment: data.site.deploymentId,
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
					selectedDeploymentId: selectedDeployment.$id,
					site: data.site,
					get show() {
						return showRedeploy;
					},

					set show($$value) {
						showRedeploy = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (selectedDeployment && showActivate) {
				$$renderer.push('<!--[0-->');

				ActivateDeploymentModal($$renderer, {
					siteId: data.site.$id,
					selectedDeploymentId: selectedDeployment.$id,
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
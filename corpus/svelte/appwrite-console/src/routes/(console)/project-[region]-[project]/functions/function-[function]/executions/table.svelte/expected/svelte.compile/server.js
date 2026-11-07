import * as $ from 'svelte/internal/server';
import { Id, MultiSelectionTable } from '$lib/components';
import { toLocaleDateTime } from '$lib/helpers/date';
import { ExecutionStatus } from '@appwrite.io/console';
import { Badge, Status, Table, Tooltip, Typography } from '@appwrite.io/pink-svelte';
import Sheet from './sheet.svelte';
import { capitalize } from '$lib/helpers/string';
import { calculateTime } from '$lib/helpers/timeConversion';
import { getBadgeTypeFromStatusCode } from '$lib/helpers/httpStatus';
import { logStatusConverter } from './store';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { func } from '../store';
import { sdk } from '$lib/stores/sdk';
import { getEffectiveExecutionStatus } from '$lib/helpers/executionTimeout';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { timer } from '$lib/actions/timer';

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { columns, executions } = $$props;
		let open = false;
		let selectedLogId = null;

		async function deleteExecutions(batchDelete) {
			const result = await batchDelete((executionId) => sdk.forProject(page.params.region, page.params.project).functions.deleteExecution({ functionId: page.params.function, executionId }));

			try {
				if (result.error) {
					trackError(result.error, Submit.ExecutionDelete);
				} else {
					trackEvent(Submit.ExecutionDelete, { total: result.deleted.length });
				}
			} finally {
				await invalidate(Dependencies.EXECUTIONS);
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

					$$renderer.push(`<!--]-->`);
				}

				function children($$renderer, root) {
					$$renderer.push(`<!--[-->`);

					const each_array_1 = $.ensure_array_like(executions.executions);

					for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
						let log = each_array_1[$$index_2];
						const effectiveStatus = getEffectiveExecutionStatus(log, $.store_get($$store_subs ??= {}, '$func', func));

						if (Table.Row.Button) {
							$$renderer.push('<!--[-->');

							Table.Row.Button($$renderer, {
								root,
								id: log.$id,
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
																value: log.$id,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(log.$id)}`);
																},
																$$slots: { default: true }
															});
														}

														$$renderer.push(`<!---->`);
													} else if (column.id === 'deploymentId') {
														$$renderer.push('<!--[1-->');

														Id($$renderer, {
															value: log.deploymentId,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(log.deploymentId)}`);
															},
															$$slots: { default: true }
														});
													} else if (column.id === '$createdAt') {
														$$renderer.push('<!--[2-->');
														DualTimeView($$renderer, { time: log.$createdAt });
													} else if (column.id === 'requestPath') {
														$$renderer.push('<!--[3-->');

														if (Typography.Code) {
															$$renderer.push('<!--[-->');

															Typography.Code($$renderer, {
																size: 'm',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(log.requestPath)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													} else if (column.id === 'responseStatusCode') {
														$$renderer.push('<!--[4-->');

														Badge($$renderer, {
															variant: 'secondary',
															type: getBadgeTypeFromStatusCode(log.responseStatusCode),
															content: log.responseStatusCode.toString()
														});
													} else if (column.id === 'requestMethod') {
														$$renderer.push('<!--[5-->');

														if (Typography.Code) {
															$$renderer.push('<!--[-->');

															Typography.Code($$renderer, {
																size: 'm',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(log.requestMethod)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													} else if (column.id === 'trigger') {
														$$renderer.push(`<!--[6-->${$.escape(capitalize(log.trigger))}`);
													} else if (column.id === 'status') {
														$$renderer.push('<!--[7-->');

														Tooltip($$renderer, {
															disabled: !log?.scheduledAt || effectiveStatus !== ExecutionStatus.Scheduled,
															maxWidth: '400px',
															children: ($$renderer) => {
																$$renderer.push(`<div>`);

																Status($$renderer, {
																	status: logStatusConverter(effectiveStatus),
																	label: capitalize(effectiveStatus)
																});

																$$renderer.push(`<!----></div>`);
															},

															$$slots: {
																default: true,
																tooltip: ($$renderer) => {
																	$$renderer.push(`<span slot="tooltip">${$.escape(`Scheduled to execute on ${toLocaleDateTime(log.scheduledAt)}`)}</span>`);
																}
															}
														});
													} else if (column.id === 'duration') {
														$$renderer.push('<!--[8-->');

														if (['processing', 'waiting'].includes(log.status)) {
															$$renderer.push(`<!--[0--><span></span>`);
														} else {
															$$renderer.push(`<!--[-1-->${$.escape(calculateTime(log.duration))}`);
														}

														$$renderer.push(`<!--]-->`);
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

					$$renderer.push(`<!--]-->`);
				}

				MultiSelectionTable($$renderer, {
					columns,
					resource: 'execution',
					onDelete: deleteExecutions,
					header,
					children,
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			Sheet($$renderer, {
				logs: executions.executions,
				logging: $.store_get($$store_subs ??= {}, '$func', func).logging,
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
					$$settled = false;
				},

				get selectedLogId() {
					return selectedLogId;
				},

				set selectedLogId($$value) {
					selectedLogId = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
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
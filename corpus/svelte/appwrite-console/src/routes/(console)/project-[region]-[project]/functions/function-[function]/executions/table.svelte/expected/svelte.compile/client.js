import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<span slot="tooltip"> </span>`);
var root_3 = $.from_html(`<span></span>`);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $func = () => $.store_get(func, '$func', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let open = $.state(false);
	let selectedLogId = $.state(null);

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

	var fragment = root_4();
	var node = $.first_child(fragment);

	{
		const header = ($$anchor, root = $.noop) => {
			var fragment_1 = $.comment();
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

			$.append($$anchor, fragment_1);
		};

		const children = ($$anchor, root = $.noop) => {
			var fragment_4 = $.comment();
			var node_3 = $.first_child(fragment_4);

			$.each(node_3, 17, () => $$props.executions.executions, (log) => log.$id, ($$anchor, log) => {
				const effectiveStatus = $.derived(() => getEffectiveExecutionStatus($.get(log), $func()));
				var fragment_5 = $.comment();
				var node_4 = $.first_child(fragment_5);

				$.component(node_4, () => Table.Row.Button, ($$anchor, Table_Row_Button) => {
					Table_Row_Button($$anchor, {
						get root() {
							return root();
						},

						get id() {
							return $.get(log).$id;
						},

						$$events: {
							click: (e) => {
								e.stopPropagation();
								$.set(open, true);
								$.set(selectedLogId, $.get(log).$id, true);
							}
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_5 = $.first_child(fragment_6);

							$.each(node_5, 17, () => $$props.columns, $.index, ($$anchor, column) => {
								var fragment_7 = $.comment();
								var node_6 = $.first_child(fragment_7);

								$.component(node_6, () => Table.Cell, ($$anchor, Table_Cell) => {
									Table_Cell($$anchor, {
										get column() {
											return $.get(column).id;
										},

										get root() {
											return root();
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_8 = $.comment();
											var node_7 = $.first_child(fragment_8);

											{
												var consequent = ($$anchor) => {
													var fragment_9 = $.comment();
													var node_8 = $.first_child(fragment_9);

													$.key(node_8, () => $.get(column).id, ($$anchor) => {
														Id($$anchor, {
															get value() {
																return $.get(log).$id;
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(() => $.set_text(text_1, $.get(log).$id));
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												};

												var consequent_1 = ($$anchor) => {
													Id($$anchor, {
														get value() {
															return $.get(log).deploymentId;
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text();

															$.template_effect(() => $.set_text(text_2, $.get(log).deploymentId));
															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												};

												var consequent_2 = ($$anchor) => {
													DualTimeView($$anchor, {
														get time() {
															return $.get(log).$createdAt;
														}
													});
												};

												var consequent_3 = ($$anchor) => {
													var fragment_15 = $.comment();
													var node_9 = $.first_child(fragment_15);

													$.component(node_9, () => Typography.Code, ($$anchor, Typography_Code) => {
														Typography_Code($$anchor, {
															size: 'm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text();

																$.template_effect(() => $.set_text(text_3, $.get(log).requestPath));
																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_15);
												};

												var consequent_4 = ($$anchor) => {
													{
														let $0 = $.derived(() => getBadgeTypeFromStatusCode($.get(log).responseStatusCode));
														let $1 = $.derived(() => $.get(log).responseStatusCode.toString());

														Badge($$anchor, {
															variant: 'secondary',
															get type() {
																return $.get($0);
															},

															get content() {
																return $.get($1);
															}
														});
													}
												};

												var consequent_5 = ($$anchor) => {
													var fragment_18 = $.comment();
													var node_10 = $.first_child(fragment_18);

													$.component(node_10, () => Typography.Code, ($$anchor, Typography_Code_1) => {
														Typography_Code_1($$anchor, {
															size: 'm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text();

																$.template_effect(() => $.set_text(text_4, $.get(log).requestMethod));
																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_18);
												};

												var consequent_6 = ($$anchor) => {
													var text_5 = $.text();

													$.template_effect(($0) => $.set_text(text_5, $0), [() => capitalize($.get(log).trigger)]);
													$.append($$anchor, text_5);
												};

												var consequent_7 = ($$anchor) => {
													{
														let $0 = $.derived(() => !$.get(log)?.scheduledAt || $.get(effectiveStatus) !== ExecutionStatus.Scheduled);

														Tooltip($$anchor, {
															get disabled() {
																return $.get($0);
															},
															maxWidth: '400px',
															children: ($$anchor, $$slotProps) => {
																var div = root_1();
																var node_11 = $.child(div);

																{
																	let $0 = $.derived(() => logStatusConverter($.get(effectiveStatus)));
																	let $1 = $.derived(() => capitalize($.get(effectiveStatus)));

																	Status(node_11, {
																		get status() {
																			return $.get($0);
																		},

																		get label() {
																			return $.get($1);
																		}
																	});
																}

																$.reset(div);
																$.append($$anchor, div);
															},

															$$slots: {
																default: true,
																tooltip: ($$anchor, $$slotProps) => {
																	var span = root_2();
																	var text_6 = $.only_child(span, true);

																	$.template_effect(($0) => $.set_text(text_6, $0), [
																		() => `Scheduled to execute on ${toLocaleDateTime($.get(log).scheduledAt)}`
																	]);

																	$.append($$anchor, span);
																}
															}
														});
													}
												};

												var consequent_9 = ($$anchor) => {
													var fragment_22 = $.comment();
													var node_12 = $.first_child(fragment_22);

													{
														var consequent_8 = ($$anchor) => {
															var span_1 = root_3();

															$.action(span_1, ($$node, $$action_arg) => timer?.($$node, $$action_arg), () => ({ start: $.get(log).$createdAt }));
															$.append($$anchor, span_1);
														};

														var d = $.derived(() => ['processing', 'waiting'].includes($.get(log).status));

														var alternate = ($$anchor) => {
															var text_7 = $.text();

															$.template_effect(($0) => $.set_text(text_7, $0), [() => calculateTime($.get(log).duration)]);
															$.append($$anchor, text_7);
														};

														$.if(node_12, ($$render) => {
															if ($.get(d)) $$render(consequent_8); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_22);
												};

												$.if(node_7, ($$render) => {
													if ($.get(column).id === '$id') $$render(consequent); else if ($.get(column).id === 'deploymentId') $$render(consequent_1, 1); else if ($.get(column).id === '$createdAt') $$render(consequent_2, 2); else if ($.get(column).id === 'requestPath') $$render(consequent_3, 3); else if ($.get(column).id === 'responseStatusCode') $$render(consequent_4, 4); else if ($.get(column).id === 'requestMethod') $$render(consequent_5, 5); else if ($.get(column).id === 'trigger') $$render(consequent_6, 6); else if ($.get(column).id === 'status') $$render(consequent_7, 7); else if ($.get(column).id === 'duration') $$render(consequent_9, 8);
												});
											}

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_7);
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			});

			$.append($$anchor, fragment_4);
		};

		MultiSelectionTable(node, {
			get columns() {
				return $$props.columns;
			},
			resource: 'execution',
			onDelete: deleteExecutions,
			header,
			children,
			$$slots: { header: true, default: true }
		});
	}

	var node_13 = $.sibling(node, 2);

	Sheet(node_13, {
		get logs() {
			return $$props.executions.executions;
		},

		get logging() {
			return $func().logging;
		},

		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		get selectedLogId() {
			return $.get(selectedLogId);
		},

		set selectedLogId($$value) {
			$.set(selectedLogId, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
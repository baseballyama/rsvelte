import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Id, MultiSelectionTable } from '$lib/components';
import { Badge, Table, Typography } from '@appwrite.io/pink-svelte';
import Sheet from './sheet.svelte';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { calculateTime } from '$lib/helpers/timeConversion';
import { getBadgeTypeFromStatusCode } from '$lib/helpers/httpStatus';
import { timer } from '$lib/actions/timer';

var root_1 = $.from_html(`<span></span>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	let openSheet = $.state(false);
	let selectedLogId = $.state(null);
	const filteredColumns = $.derived(() => $$props.columns.filter((c) => !c.exclude));

	async function deleteLogs(batchDelete) {
		const result = await batchDelete((logId) => sdk.forProject(page.params.region, page.params.project).sites.deleteLog({ siteId: page.params.site, logId }));

		try {
			if (result.error) {
				trackError(result.error, Submit.LogDelete);
			} else {
				trackEvent(Submit.LogDelete, { total: result.deleted.length });
			}
		} finally {
			await invalidate(Dependencies.EXECUTIONS);
		}

		return result;
	}

	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		const header = ($$anchor, root = $.noop) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => $.get(filteredColumns), $.index, ($$anchor, $$item) => {
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

			$.each(node_3, 17, () => $$props.logs.executions, (log) => log.$id, ($$anchor, log) => {
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
								$.set(openSheet, true);
								$.set(selectedLogId, $.get(log).$id, true);
							}
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_5 = $.first_child(fragment_6);

							$.each(node_5, 17, () => $.get(filteredColumns), $.index, ($$anchor, column) => {
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
													var fragment_14 = $.comment();
													var node_9 = $.first_child(fragment_14);

													$.component(node_9, () => Typography.Code, ($$anchor, Typography_Code) => {
														Typography_Code($$anchor, {
															size: 'm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text();

																$.template_effect(() => $.set_text(text_3, $.get(log).requestMethod));
																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_14);
												};

												var consequent_4 = ($$anchor) => {
													var fragment_16 = $.comment();
													var node_10 = $.first_child(fragment_16);

													{
														var consequent_3 = ($$anchor) => {
															var span = root_1();

															$.action(span, ($$node, $$action_arg) => timer?.($$node, $$action_arg), () => ({ start: $.get(log).$createdAt }));
															$.append($$anchor, span);
														};

														var d = $.derived(() => ['processing', 'waiting'].includes($.get(log).status));

														var alternate = ($$anchor) => {
															var text_4 = $.text();

															$.template_effect(($0) => $.set_text(text_4, $0), [() => calculateTime($.get(log).duration)]);
															$.append($$anchor, text_4);
														};

														$.if(node_10, ($$render) => {
															if ($.get(d)) $$render(consequent_3); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_16);
												};

												var consequent_5 = ($$anchor) => {
													var div = root_2();
													var node_11 = $.child(div);

													{
														let $0 = $.derived(() => getBadgeTypeFromStatusCode($.get(log).responseStatusCode));
														let $1 = $.derived(() => $.get(log).responseStatusCode.toString());

														Badge(node_11, {
															variant: 'secondary',
															get type() {
																return $.get($0);
															},

															get content() {
																return $.get($1);
															}
														});
													}

													$.reset(div);
													$.append($$anchor, div);
												};

												var consequent_6 = ($$anchor) => {
													var fragment_18 = $.comment();
													var node_12 = $.first_child(fragment_18);

													$.component(node_12, () => Typography.Code, ($$anchor, Typography_Code_1) => {
														Typography_Code_1($$anchor, {
															size: 'm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text();

																$.template_effect(() => $.set_text(text_5, $.get(log).requestPath));
																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_18);
												};

												var consequent_7 = ($$anchor) => {
													DualTimeView($$anchor, {
														get time() {
															return $.get(log).$createdAt;
														}
													});
												};

												$.if(node_7, ($$render) => {
													if ($.get(column).id === '$id') $$render(consequent); else if ($.get(column).id === 'deploymentId') $$render(consequent_1, 1); else if ($.get(column).id === 'requestMethod') $$render(consequent_2, 2); else if ($.get(column).id === 'duration') $$render(consequent_4, 3); else if ($.get(column).id === 'responseStatusCode') $$render(consequent_5, 4); else if ($.get(column).id === 'requestPath') $$render(consequent_6, 5); else if ($.get(column).id === '$createdAt') $$render(consequent_7, 6);
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
			resource: 'log',
			get columns() {
				return $.get(filteredColumns);
			},
			onDelete: deleteLogs,
			header,
			children,
			$$slots: { header: true, default: true }
		});
	}

	var node_13 = $.sibling(node, 2);

	Sheet(node_13, {
		get logs() {
			return $$props.logs.executions;
		},

		get open() {
			return $.get(openSheet);
		},

		set open($$value) {
			$.set(openSheet, $$value, true);
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
}
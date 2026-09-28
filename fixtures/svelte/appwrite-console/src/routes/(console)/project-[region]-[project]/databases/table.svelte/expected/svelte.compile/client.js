import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { columns, getDatabaseTypeTitle } from './store';
import { Id } from '$lib/components';
import { toDatabaseType, useTerminology } from '$database/(entity)';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { resolveRoute, withPath } from '$lib/stores/navigation';
import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
import { Layout, Tooltip, Table, Icon } from '@appwrite.io/pink-svelte';

var root_1 = $.from_html(`<!> No backup policies`, 1);
var root_2 = $.from_html(`<span class="u-trim"><!></span>`);
var root_3 = $.from_html(`<span slot="tooltip"> </span>`);

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function getPolicyDescription(cron) {
		const [minute, hour, dayOfMonth,, dayOfWeek] = cron.split(' ');

		if (dayOfMonth !== '*') return 'Monthly';
		if (dayOfWeek !== '*') return 'Weekly on Mondays';
		if (minute !== '*' && hour === '*') return 'Hourly';
		if (hour !== '*') return 'Daily';
	}

	function getPoliciesDescription(policies) {
		return policies?.map((policy) => getPolicyDescription(policy.schedule)).join(', ') ?? '';
	}

	function getEntityUrl(database, entityId) {
		const terminology = useTerminology(toDatabaseType(database.type));
		const entityType = terminology.entity.lower.singular;

		return withPath(resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', { ...page.params, database: database.$id }), entityId ? `/${entityType}-${entityId}` : '');
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Table.Root, ($$anchor, Table_Root) => {
		Table_Root($$anchor, {
			get columns() {
				return $columns();
			},
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$anchor, $$slotProps) => {
					const root = $.derived(() => $$slotProps.root);
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.each(node_1, 17, () => $$props.databases.databases, (database) => database.$id, ($$anchor, database) => {
						const entityId = $.derived(() => $$props.entities[$.get(database)?.$id] ?? null);
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => getEntityUrl($.get(database), $.get(entityId)));

							$.component(node_2, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
								Table_Row_Link($$anchor, {
									get root() {
										return $.get(root);
									},

									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.each(node_3, 1, $columns, $.index, ($$anchor, column) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Table.Cell, ($$anchor, Table_Cell) => {
												Table_Cell($$anchor, {
													get column() {
														return $.get(column).id;
													},

													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_5 = $.first_child(fragment_5);

														{
															var consequent = ($$anchor) => {
																var fragment_6 = $.comment();
																var node_6 = $.first_child(fragment_6);

																$.key(node_6, $columns, ($$anchor) => {
																	Id($$anchor, {
																		get value() {
																			return $.get(database).$id;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text = $.text();

																			$.template_effect(() => $.set_text(text, $.get(database).$id));
																			$.append($$anchor, text);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_6);
															};

															var consequent_1 = ($$anchor) => {
																var text_1 = $.text();

																$.template_effect(() => $.set_text(text_1, $.get(database).name));
																$.append($$anchor, text_1);
															};

															var consequent_2 = ($$anchor) => {
																var text_2 = $.text();

																$.template_effect(($0) => $.set_text(text_2, $0), [() => getDatabaseTypeTitle($.get(database))]);
																$.append($$anchor, text_2);
															};

															var consequent_4 = ($$anchor) => {
																const backupPolicies = $.derived(() => $$props.policies?.[$.get(database).$id] ?? null);
																const lastBackup = $.derived(() => $$props.lastBackups?.[$.get(database).$id] ?? null);
																const description = $.derived(() => getPoliciesDescription($.get(backupPolicies)));

																{
																	let $0 = $.derived(() => !$.get(backupPolicies) || !$.get(lastBackup));

																	Tooltip($$anchor, {
																		placement: 'bottom',
																		get disabled() {
																			return $.get($0);
																		},
																		maxWidth: 'fit-content',
																		children: ($$anchor, $$slotProps) => {
																			var span = root_2();
																			var node_7 = $.child(span);

																			{
																				var consequent_3 = ($$anchor) => {
																					var fragment_12 = $.comment();
																					var node_8 = $.first_child(fragment_12);

																					$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack) => {
																						Layout_Stack($$anchor, {
																							direction: 'row',
																							gap: 'xxs',
																							alignItems: 'center',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_13 = root_1();
																								var node_9 = $.first_child(fragment_13);

																								Icon(node_9, {
																									get icon() {
																										return IconExclamation;
																									},
																									size: 's',
																									color: '--bgcolor-warning'
																								});

																								$.next();
																								$.append($$anchor, fragment_13);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_12);
																				};

																				var alternate = ($$anchor) => {
																					var text_3 = $.text();

																					$.template_effect(() => $.set_text(text_3, $.get(description)));
																					$.append($$anchor, text_3);
																				};

																				$.if(node_7, ($$render) => {
																					if (!$.get(backupPolicies)) $$render(consequent_3); else $$render(alternate, -1);
																				});
																			}

																			$.reset(span);
																			$.append($$anchor, span);
																		},

																		$$slots: {
																			default: true,
																			tooltip: ($$anchor, $$slotProps) => {
																				var span_1 = root_3();
																				var text_4 = $.only_child(span_1, true);

																				$.template_effect(() => $.set_text(text_4, `Last backup: ${$.get(lastBackup)}`));
																				$.append($$anchor, span_1);
																			}
																		}
																	});
																}
															};

															var consequent_5 = ($$anchor) => {
																DualTimeView($$anchor, {
																	get time() {
																		return $.get(database)[$.get(column).id];
																	},
																	showDatetime: true
																});
															};

															var alternate_1 = ($$anchor) => {
																var text_5 = $.text();

																$.template_effect(() => $.set_text(text_5, $.get(database)[$.get(column).id]));
																$.append($$anchor, text_5);
															};

															$.if(node_5, ($$render) => {
																if ($.get(column).id === '$id') $$render(consequent); else if ($.get(column).id === 'name') $$render(consequent_1, 1); else if ($.get(column).id === 'type') $$render(consequent_2, 2); else if ($.get(column).id === 'backup') $$render(consequent_4, 3); else if ($.get(column).type === 'datetime') $$render(consequent_5, 4); else $$render(alternate_1, -1);
															});
														}

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_2);
					});

					$.append($$anchor, fragment_1);
				},

				header: ($$anchor, $$slotProps) => {
					const root = $.derived(() => $$slotProps.root);
					var fragment_17 = $.comment();
					var node_10 = $.first_child(fragment_17);

					$.each(node_10, 1, $columns, $.index, ($$anchor, $$item) => {
						let id = () => $.get($$item).id;
						let title = () => $.get($$item).title;
						var fragment_18 = $.comment();
						var node_11 = $.first_child(fragment_18);

						$.component(node_11, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
							Table_Header_Cell($$anchor, {
								get column() {
									return id();
								},

								get root() {
									return $.get(root);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text();

									$.template_effect(() => $.set_text(text_6, title()));
									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_18);
					});

					$.append($$anchor, fragment_17);
				}
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
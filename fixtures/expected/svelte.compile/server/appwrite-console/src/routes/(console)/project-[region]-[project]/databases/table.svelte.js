import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { columns, getDatabaseTypeTitle } from './store';
import { Id } from '$lib/components';
import { toDatabaseType, useTerminology } from '$database/(entity)';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { resolveRoute, withPath } from '$lib/stores/navigation';
import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
import { Layout, Tooltip, Table, Icon } from '@appwrite.io/pink-svelte';

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { entities, policies, databases, lastBackups } = $$props;

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

		if (Table.Root) {
			$$renderer.push('<!--[-->');

			Table.Root($$renderer, {
				columns: $.store_get($$store_subs ??= {}, '$columns', columns),
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { root }) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(databases.databases);

						for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
							let database = each_array[$$index_2];
							const entityId = entities[database?.$id] ?? null;

							if (Table.Row.Link) {
								$$renderer.push('<!--[-->');

								Table.Row.Link($$renderer, {
									root,
									href: getEntityUrl(database, entityId),
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array_1 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

										for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
											let column = each_array_1[$$index_1];

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
																	value: database.$id,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(database.$id)}`);
																	},
																	$$slots: { default: true }
																});
															}

															$$renderer.push(`<!---->`);
														} else if (column.id === 'name') {
															$$renderer.push(`<!--[1-->${$.escape(database.name)}`);
														} else if (column.id === 'type') {
															$$renderer.push(`<!--[2-->${$.escape(getDatabaseTypeTitle(database))}`);
														} else if (column.id === 'backup') {
															$$renderer.push('<!--[3-->');

															const backupPolicies = policies?.[database.$id] ?? null;
															const lastBackup = lastBackups?.[database.$id] ?? null;
															const description = getPoliciesDescription(backupPolicies);

															Tooltip($$renderer, {
																placement: 'bottom',
																disabled: !backupPolicies || !lastBackup,
																maxWidth: 'fit-content',
																children: ($$renderer) => {
																	$$renderer.push(`<span class="u-trim">`);

																	if (!backupPolicies) {
																		$$renderer.push('<!--[0-->');

																		if (Layout.Stack) {
																			$$renderer.push('<!--[-->');

																			Layout.Stack($$renderer, {
																				direction: 'row',
																				gap: 'xxs',
																				alignItems: 'center',
																				children: ($$renderer) => {
																					Icon($$renderer, { icon: IconExclamation, size: 's', color: '--bgcolor-warning' });
																					$$renderer.push(`<!----> No backup policies`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	} else {
																		$$renderer.push(`<!--[-1-->${$.escape(description)}`);
																	}

																	$$renderer.push(`<!--]--></span>`);
																},

																$$slots: {
																	default: true,
																	tooltip: ($$renderer) => {
																		$$renderer.push(`<span slot="tooltip">${$.escape(`Last backup: ${lastBackup}`)}</span>`);
																	}
																}
															});
														} else if (column.type === 'datetime') {
															$$renderer.push('<!--[4-->');
															DualTimeView($$renderer, { time: database[column.id], showDatetime: true });
														} else {
															$$renderer.push(`<!--[-1-->${$.escape(database[column.id])}`);
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
					},

					header: ($$renderer, { root }) => {
						{
							$$renderer.push(`<!--[-->`);

							const each_array_2 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

							for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
								let { id, title } = each_array_2[$$index];

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
					}
				}
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
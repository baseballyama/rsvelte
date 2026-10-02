import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Id, MultiSelectionTable } from '$lib/components';
import { Dependencies } from '$lib/constants';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { canWriteTables } from '$lib/stores/roles';
import { Table } from '@appwrite.io/pink-svelte';
import { tableViewColumns, buildEntityRoute } from './store';
import { subNavigation } from '$lib/stores/database';

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { entities, terminology, databaseSdk } = $$props;
		const entitySingular = $.derived(() => terminology.entity.lower.singular);

		async function onDelete(batchDelete) {
			const result = await batchDelete((entityId) => databaseSdk.deleteEntity({ databaseId: page.params.database, entityId }));

			try {
				if (result.error) {
					trackError(result.error, Submit.TableDelete);
				} else {
					trackEvent(Submit.TableDelete, { total: result.deleted.length });
				}
			} finally {
				await invalidate(Dependencies.TABLES);
				subNavigation.update();
			}

			return result;
		}

		{
			function header($$renderer, root) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$tableViewColumns', tableViewColumns));

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

				const each_array_1 = $.ensure_array_like(entities.entities);

				for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
					let entity = each_array_1[$$index_2];

					if (Table.Row.Link) {
						$$renderer.push('<!--[-->');

						Table.Row.Link($$renderer, {
							root,
							id: entity.$id,
							href: buildEntityRoute(page, entitySingular(), entity.$id),
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_2 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$tableViewColumns', tableViewColumns));

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
															value: entity.$id,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(entity.$id)}`);
															},
															$$slots: { default: true }
														});
													}

													$$renderer.push(`<!---->`);
												} else if (column.id === 'name') {
													$$renderer.push(`<!--[1-->${$.escape(entity.name)}`);
												} else {
													$$renderer.push('<!--[-1-->');
													DualTimeView($$renderer, { time: entity[column.id] });
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
				resource: entitySingular(),
				columns: $.store_get($$store_subs ??= {}, '$tableViewColumns', tableViewColumns),
				allowSelection: $.store_get($$store_subs ??= {}, '$canWriteTables', canWriteTables),
				onDelete,
				header,
				children,
				$$slots: { header: true, default: true }
			});
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
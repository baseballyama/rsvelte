import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $tableViewColumns = () => $.store_get(tableViewColumns, '$tableViewColumns', $$stores);
	const $canWriteTables = () => $.store_get(canWriteTables, '$canWriteTables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const entitySingular = $.derived(() => $$props.terminology.entity.lower.singular);

	async function onDelete(batchDelete) {
		const result = await batchDelete((entityId) => $$props.databaseSdk.deleteEntity({ databaseId: page.params.database, entityId }));

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
		const header = ($$anchor, root = $.noop) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 1, $tableViewColumns, ({ id, title }) => id, ($$anchor, $$item) => {
				let id = () => $.get($$item).id;
				let title = () => $.get($$item).title;
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				$.component(node_1, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
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
			var node_2 = $.first_child(fragment_4);

			$.each(node_2, 17, () => $$props.entities.entities, (entity) => entity.$id, ($$anchor, entity) => {
				var fragment_5 = $.comment();
				var node_3 = $.first_child(fragment_5);

				{
					let $0 = $.derived(() => buildEntityRoute(page, $.get(entitySingular), $.get(entity).$id));

					$.component(node_3, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
						Table_Row_Link($$anchor, {
							get root() {
								return root();
							},

							get id() {
								return $.get(entity).$id;
							},

							get href() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_4 = $.first_child(fragment_6);

								$.each(node_4, 1, $tableViewColumns, $.index, ($$anchor, column) => {
									var fragment_7 = $.comment();
									var node_5 = $.first_child(fragment_7);

									$.component(node_5, () => Table.Cell, ($$anchor, Table_Cell) => {
										Table_Cell($$anchor, {
											get column() {
												return $.get(column).id;
											},

											get root() {
												return root();
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_8 = $.comment();
												var node_6 = $.first_child(fragment_8);

												{
													var consequent = ($$anchor) => {
														var fragment_9 = $.comment();
														var node_7 = $.first_child(fragment_9);

														$.key(node_7, $tableViewColumns, ($$anchor) => {
															Id($$anchor, {
																get value() {
																	return $.get(entity).$id;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text();

																	$.template_effect(() => $.set_text(text_1, $.get(entity).$id));
																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_9);
													};

													var consequent_1 = ($$anchor) => {
														var text_2 = $.text();

														$.template_effect(() => $.set_text(text_2, $.get(entity).name));
														$.append($$anchor, text_2);
													};

													var alternate = ($$anchor) => {
														DualTimeView($$anchor, {
															get time() {
																return $.get(entity)[$.get(column).id];
															}
														});
													};

													$.if(node_6, ($$render) => {
														if ($.get(column).id === '$id') $$render(consequent); else if ($.get(column).id === 'name') $$render(consequent_1, 1); else $$render(alternate, -1);
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
				}

				$.append($$anchor, fragment_5);
			});

			$.append($$anchor, fragment_4);
		};

		MultiSelectionTable($$anchor, {
			get resource() {
				return $.get(entitySingular);
			},

			get columns() {
				return $tableViewColumns();
			},

			get allowSelection() {
				return $canWriteTables();
			},
			onDelete,
			header,
			children,
			$$slots: { header: true, default: true }
		});
	}

	$.pop();
	$$cleanup();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { symmetricDifference } from '$lib/helpers/array';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { page } from '$app/state';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { get, writable } from 'svelte/store';
import { Query } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';
import { PROHIBITED_ROW_KEYS } from '../store';
import { buildWildcardEntitiesQuery } from '$database/store';
import RelatedRowColumns from './relatedRowColumns.svelte';
import { isRelationship, isRelationshipToMany, buildPayload } from './store';
import { Accordion, Layout, Skeleton } from '@appwrite.io/pink-svelte';
import { deepClone } from '$lib/helpers/object';
import { preferences } from '$lib/stores/preferences';
import { getTerminologies } from '$database/(entity)';
import { onMount } from 'svelte';

var root = $.from_html(`<div><!></div>`);

export default function EditRelated($$anchor, $$props) {
	$.push($$props, true);

	const databaseId = page.params.database;
	let disabledState = $.prop($$props, 'disabledState', 15, true);
	let loading = $.state(false);
	let fetchedRows = $.state($.proxy([]));
	let relatedTable = $.state(null);
	let workData = $.state($.proxy(new Map()));
	let columnFormWrapper = $.state(null);
	const { databaseSdk } = getTerminologies();

	onMount(() => {
		if ($$props.rows && $$props.tableId) {
			loadRelatedRow().then(() => {
				focusFirstInput();
			});
		}

		/* silences the not read error warning */
		disabledState();
	});

	function isSingleStore() {
		return typeof $$props.rows === 'string';
	}

	async function loadRelatedRow() {
		$.set(loading, true);

		try {
			if (isSingleStore()) {
				// Load schema first so relationship wildcard selects are correct.
				$.set(relatedTable, await databaseSdk.getEntity({ databaseId, entityId: $$props.tableId }), true);

				const fetchedRow = await sdk.forProject(page.params.region, page.params.project).tablesDB.getRow({
					databaseId,
					tableId: $$props.tableId,
					rowId: $$props.rows,
					queries: buildWildcardEntitiesQuery($.get(relatedTable))
				});

				$.set(fetchedRows, [fetchedRow], true);
			} else {
				let fetchedTables = [];
				const processedRows = [];
				const existingRows = $$props.rows;
				const firstTableId = existingRows[0].$tableId;
				const uniqueTableIds = [...new Set(existingRows.map((row) => row.$tableId))];

				const missingTableIds = uniqueTableIds.filter((tableId) => {
					return !page.data.tables?.find((table) => table.$id === tableId);
				});

				if (missingTableIds.length > 0) {
					const tablesResponse = await databaseSdk.listEntities({
						databaseId,
						queries: [
							Query.equal('$id', missingTableIds),
							Query.limit(missingTableIds.length)
						]
					});

					fetchedTables = tablesResponse.entities;
				}

				const allTables = [...page.data.entities || [], ...fetchedTables];

				$.set(relatedTable, allTables.find((table) => table.$id === firstTableId) || null, true);

				let rowsMissingData = [];

				for (const row of existingRows) {
					const rowTable = allTables.find((table) => table.$id === row.$tableId);
					const hasAllColumns = rowTable.columns.every((column) => column.key in row);

					if (!hasAllColumns) {
						rowsMissingData.push({ row, rowTable });
					} else {
						processedRows.push(row);
					}
				}

				if (rowsMissingData.length > 0) {
					const rowsByTable = new Map();

					for (const { row, rowTable } of rowsMissingData) {
						if (!rowsByTable.has(row.$tableId)) {
							rowsByTable.set(row.$tableId, { rows: [], rowTable });
						}

						rowsByTable.get(row.$tableId).rows.push(row);
					}

					const fetchPromises = Array.from(rowsByTable.entries()).map(async ([tableId, { rows, rowTable }]) => {
						const rowIds = rows.map((row) => row.$id);

						const response = await sdk.forProject(page.params.region, page.params.project).tablesDB.listRows({
							databaseId,
							tableId,
							queries: [
								Query.equal('$id', rowIds),
								Query.limit(rowIds.length),
								...buildWildcardEntitiesQuery(rowTable)
							]
						});

						return response.rows;
					});

					const allCompleteRows = await Promise.all(fetchPromises);

					processedRows.push(...allCompleteRows.flat());
				}

				$.set(fetchedRows, processedRows, true);
			}

			const newWorkData = new Map();

			$.get(fetchedRows).forEach((row) => {
				const filteredKeys = Object.keys(row).filter((key) => {
					return !PROHIBITED_ROW_KEYS.includes(key);
				});

				const workingData = filteredKeys.reduce(
					(obj, key) => {
						obj[key] = row[key];

						return obj;
					},
					{}
				);

				const clonedObject = deepClone(workingData);

				newWorkData.set(row.$id, writable(clonedObject));
			});

			$.set(workData, newWorkData, true);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.RowUpdate);
		} finally {
			$.set(loading, false);
		}
	}

	function compareColumns(field, $work, originalRow) {
		if (!field) {
			return false;
		}

		const workColumn = $work?.[field.key];
		const currentColumn = originalRow?.[field.key];

		if (field.array) {
			return !symmetricDifference(Array.from(workColumn), Array.from(currentColumn)).length;
		}

		if (isRelationship(field)) {
			if (isRelationshipToMany(field)) {
				if (!Array.isArray(workColumn) || !Array.isArray(currentColumn)) {
					return workColumn === currentColumn;
				}

				const workIds = workColumn.map((doc) => typeof doc === 'string' ? doc : doc.$id);
				const relatedIds = currentColumn.map((doc) => typeof doc === 'string' ? doc : doc.$id);

				return !symmetricDifference(workIds, relatedIds).length;
			} else {
				const workId = typeof workColumn === 'string' ? workColumn : workColumn?.$id;
				const relatedId = typeof currentColumn === 'string' ? currentColumn : currentColumn?.$id;

				return workId === relatedId;
			}
		}

		return workColumn === currentColumn;
	}

	function calculateAndCompareDisabledState() {
		if (!$.get(relatedTable)?.fields?.length || !$.get(fetchedRows).length) return true;

		if (isSingleStore()) {
			const rowId = $.get(fetchedRows)[0].$id;
			const row = $.get(fetchedRows).find((r) => r.$id === rowId);
			const work = $.get(workData).get(rowId);

			if (!row || !work) return true;

			const workValue = get(work);

			return $.get(relatedTable).fields.every((field) => compareColumns(field, workValue, row));
		} else {
			return $.get(fetchedRows).every((row) => {
				const work = $.get(workData).get(row.$id);

				if (!work) return true;

				const workValue = get(work);

				return $.get(relatedTable).fields.every((field) => compareColumns(field, workValue, row));
			});
		}
	}

	async function update(rowId) {
		try {
			if (rowId) {
				const work = $.get(workData).get(rowId);
				const workValue = get(work);
				const payload = buildPayload($.get(relatedTable).fields, workValue);

				await sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({
					databaseId,
					tableId: $.get(relatedTable).$id,
					rowId,
					data: payload,
					permissions: workValue.$permissions
				});

				addNotification({ message: 'Related row has been updated', type: 'success' });
			} else {
				const updatePromises = $.get(fetchedRows).map(async (row) => {
					const work = $.get(workData).get(row.$id);

					if (!work) return;

					const workValue = get(work);
					const payload = buildPayload($.get(relatedTable).fields, workValue);

					return sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({
						databaseId,
						tableId: $.get(relatedTable).$id,
						rowId: row.$id,
						data: payload,
						permissions: workValue.$permissions
					});
				});

				await Promise.all(updatePromises);
				addNotification({ message: 'Related row has been updated', type: 'success' });
			}

			invalidate(Dependencies.ROW);
			trackEvent(Submit.RowUpdate);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.RowUpdate);
		}
	}

	function focusFirstInput() {
		const firstInput = $.get(columnFormWrapper)?.querySelector('input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])');

		firstInput?.focus({ preventScroll: true });
	}

	function handleFormUpdate(rowId) {
		return (updatedFormValues) => {
			const workStore = $.get(workData).get(rowId);

			if (workStore) {
				workStore.set(updatedFormValues);
				disabledState(calculateAndCompareDisabledState());
			}
		};
	}

	function getAccordionTitle(row) {
		const names = preferences.getDisplayNames(row.$tableId).filter((name) => name !== '$id');
		const values = names.map((name) => row?.[name]).filter((value) => value != null && typeof value === 'string' && value !== '');

		if (!values.length) {
			return row.$id;
		}

		return `${values.join(' | ')} (...${row.$id.slice(-5)})`;
	}

	$.user_effect(() => {
		disabledState(calculateAndCompareDisabledState());
	});

	var $$exports = { update };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.set_style(div, '', {}, { 'margin-inline-end': '2.25rem' });

			var node_1 = $.child(div);

			Skeleton(node_1, { variant: 'line', height: 40, width: 'auto' });
			$.reset(div);
			$.append($$anchor, div);
		};

		var consequent_4 = ($$anchor) => {
			const twoWayKeys = $.derived(() => new Set($.get(relatedTable).fields.filter((column) => column.twoWay).map((c) => c.key)));
			const columnsToRender = $.derived(() => $.get(relatedTable).fields.filter((field) => !$.get(twoWayKeys).has(field.key)));
			var div_1 = root();
			var node_2 = $.child(div_1);

			{
				var consequent_2 = ($$anchor) => {
					const workStore = $.derived(() => $.get(workData).get($.get(fetchedRows)[0].$id));
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					{
						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => handleFormUpdate($.get(fetchedRows)[0].$id));

								RelatedRowColumns($$anchor, {
									get workStore() {
										return $.get(workStore);
									},

									get columnsToRender() {
										return $.get(columnsToRender);
									},

									get onUpdateFormValues() {
										return $.get($0);
									}
								});
							}
						};

						$.if(node_3, ($$render) => {
							if ($.get(workStore)) $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							direction: 'column',
							gap: 'm',
							class: 'column-item-stack',
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
									Layout_Stack_1($$anchor, {
										direction: 'column',
										gap: 'xs',
										class: 'column-item-stack',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_6 = $.first_child(fragment_5);

											$.each(node_6, 19, () => $.get(fetchedRows), (row) => row.$id, ($$anchor, row, index) => {
												const workStore = $.derived(() => $.get(workData).get($.get(row).$id));

												{
													let $0 = $.derived(() => getAccordionTitle($.get(row)));
													let $1 = $.derived(() => $.get(index) >= $.get(fetchedRows).length - 1);

													Accordion($$anchor, {
														get title() {
															return $.get($0);
														},

														get hideDivider() {
															return $.get($1);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_7 = $.comment();
															var node_7 = $.first_child(fragment_7);

															{
																var consequent_3 = ($$anchor) => {
																	{
																		let $0 = $.derived(() => handleFormUpdate($.get(row).$id));

																		RelatedRowColumns($$anchor, {
																			get workStore() {
																				return $.get(workStore);
																			},

																			get columnsToRender() {
																				return $.get(columnsToRender);
																			},
																			gap: 'm',
																			get onUpdateFormValues() {
																				return $.get($0);
																			}
																		});
																	}
																};

																$.if(node_7, ($$render) => {
																	if ($.get(workStore)) $$render(consequent_3);
																});
															}

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												}
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node_2, ($$render) => {
					if ($.get(fetchedRows).length === 1) $$render(consequent_2); else $$render(alternate, -1);
				});
			}

			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(columnFormWrapper, $$value), () => $.get(columnFormWrapper));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else if ($.get(relatedTable)?.fields?.length && $.get(fetchedRows).length) $$render(consequent_4, 1);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}
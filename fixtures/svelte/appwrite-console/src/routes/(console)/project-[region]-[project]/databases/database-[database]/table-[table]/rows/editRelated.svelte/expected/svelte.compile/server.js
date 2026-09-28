import * as $ from 'svelte/internal/server';
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

export default function EditRelated($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const databaseId = page.params.database;
		let { rows, tableId, disabledState = true } = $$props;
		let loading = false;
		let fetchedRows = [];
		let relatedTable = null;
		let workData = new Map();
		let columnFormWrapper = null;
		const { databaseSdk } = getTerminologies();

		onMount(() => {
			if (rows && tableId) {
				loadRelatedRow().then(() => {
					focusFirstInput();
				});
			}

			/* silences the not read error warning */
			disabledState;
		});

		function isSingleStore() {
			return typeof rows === 'string';
		}

		async function loadRelatedRow() {
			loading = true;

			try {
				if (isSingleStore()) {
					// Load schema first so relationship wildcard selects are correct.
					relatedTable = await databaseSdk.getEntity({ databaseId, entityId: tableId });

					const fetchedRow = await sdk.forProject(page.params.region, page.params.project).tablesDB.getRow({
						databaseId,
						tableId,
						rowId: rows,
						queries: buildWildcardEntitiesQuery(relatedTable)
					});

					fetchedRows = [fetchedRow];
				} else {
					let fetchedTables = [];
					const processedRows = [];
					const existingRows = rows;
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

					relatedTable = allTables.find((table) => table.$id === firstTableId) || null;

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

					fetchedRows = processedRows;
				}

				const newWorkData = new Map();

				fetchedRows.forEach((row) => {
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

				workData = newWorkData;
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.RowUpdate);
			} finally {
				loading = false;
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
			if (!relatedTable?.fields?.length || !fetchedRows.length) return true;

			if (isSingleStore()) {
				const rowId = fetchedRows[0].$id;
				const row = fetchedRows.find((r) => r.$id === rowId);
				const work = workData.get(rowId);

				if (!row || !work) return true;

				const workValue = get(work);

				return relatedTable.fields.every((field) => compareColumns(field, workValue, row));
			} else {
				return fetchedRows.every((row) => {
					const work = workData.get(row.$id);

					if (!work) return true;

					const workValue = get(work);

					return relatedTable.fields.every((field) => compareColumns(field, workValue, row));
				});
			}
		}

		async function update(rowId) {
			try {
				if (rowId) {
					const work = workData.get(rowId);
					const workValue = get(work);
					const payload = buildPayload(relatedTable.fields, workValue);

					await sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({
						databaseId,
						tableId: relatedTable.$id,
						rowId,
						data: payload,
						permissions: workValue.$permissions
					});

					addNotification({ message: 'Related row has been updated', type: 'success' });
				} else {
					const updatePromises = fetchedRows.map(async (row) => {
						const work = workData.get(row.$id);

						if (!work) return;

						const workValue = get(work);
						const payload = buildPayload(relatedTable.fields, workValue);

						return sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({
							databaseId,
							tableId: relatedTable.$id,
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
			const firstInput = columnFormWrapper?.querySelector('input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])');

			firstInput?.focus({ preventScroll: true });
		}

		function handleFormUpdate(rowId) {
			return (updatedFormValues) => {
				const workStore = workData.get(rowId);

				if (workStore) {
					workStore.set(updatedFormValues);
					disabledState = calculateAndCompareDisabledState();
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

		if (loading) {
			$$renderer.push(`<!--[0--><div${$.attr_style('', { 'margin-inline-end': '2.25rem' })}>`);
			Skeleton($$renderer, { variant: 'line', height: 40, width: 'auto' });
			$$renderer.push(`<!----></div>`);
		} else if (relatedTable?.fields?.length && fetchedRows.length) {
			$$renderer.push('<!--[1-->');

			const twoWayKeys = new Set(relatedTable.fields.filter((column) => column.twoWay).map((c) => c.key));
			const columnsToRender = relatedTable.fields.filter((field) => !twoWayKeys.has(field.key));

			$$renderer.push(`<div>`);

			if (fetchedRows.length === 1) {
				$$renderer.push('<!--[0-->');

				const workStore = workData.get(fetchedRows[0].$id);

				if (workStore) {
					$$renderer.push('<!--[0-->');

					RelatedRowColumns($$renderer, {
						workStore,
						columnsToRender,
						onUpdateFormValues: handleFormUpdate(fetchedRows[0].$id)
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');

				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						direction: 'column',
						gap: 'm',
						class: 'column-item-stack',
						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'column',
									gap: 'xs',
									class: 'column-item-stack',
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(fetchedRows);

										for (let index = 0, $$length = each_array.length; index < $$length; index++) {
											let row = each_array[index];
											const workStore = workData.get(row.$id);

											Accordion($$renderer, {
												title: getAccordionTitle(row),
												hideDivider: index >= fetchedRows.length - 1,
												children: ($$renderer) => {
													if (workStore) {
														$$renderer.push('<!--[0-->');

														RelatedRowColumns($$renderer, {
															workStore,
															columnsToRender,
															gap: 'm',
															onUpdateFormValues: handleFormUpdate(row.$id)
														});
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											});
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
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { disabledState, update });
	});
}
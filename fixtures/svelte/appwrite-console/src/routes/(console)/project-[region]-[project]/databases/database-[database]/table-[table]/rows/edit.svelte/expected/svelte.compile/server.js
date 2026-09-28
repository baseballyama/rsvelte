import * as $ from 'svelte/internal/server';
import { symmetricDifference } from '$lib/helpers/array';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { page } from '$app/state';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { writable } from 'svelte/store';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';
import { PROHIBITED_ROW_KEYS } from '../store';
import ColumnItem from './columns/columnItem.svelte';

import {
	isRelationship,
	isRelationshipToMany,
	isSpatialType,
	buildPayload
} from './store';

import { Layout, Skeleton } from '@appwrite.io/pink-svelte';
import { deepClone } from '$lib/helpers/object';
import { toRelationalField } from '$database/(entity)';
import { buildWildcardEntitiesQuery } from '$database/store';
import deepEqual from 'deep-equal';
import { onMount } from 'svelte';

export default function Edit($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			table,
			row = void 0,
			rowId = null,
			autoFocus = true,
			disabled = true
		} = $$props;

		let loading = false;
		let work = null;
		let columnFormWrapper = null;

		onMount(() => {
			/* silences the not read error warning */
			disabled;
		});

		function initWork() {
			const filteredKeys = Object.keys(row).filter((key) => {
				return !PROHIBITED_ROW_KEYS.includes(key);
			});

			const result = filteredKeys.reduce(
				(obj, key) => {
					obj[key] = row[key];

					return obj;
				},
				{}
			);

			return writable(deepClone(result));
		}

		async function loadRowFromId() {
			if (!rowId) return;

			loading = true;

			try {
				row = await sdk.forProject(page.params.region, page.params.project).tablesDB.getRow({
					databaseId: table.databaseId,
					tableId: table.$id,
					rowId,
					queries: buildWildcardEntitiesQuery(table)
				});
			} catch(error) {
				addNotification({
					message: `Failed to load row: ${error.message}`,
					type: 'error'
				});

				row = null;
			} finally {
				rowId = null;
				loading = false;
			}
		}

		function compareColumns(column, $work, $doc) {
			if (!column) {
				return false;
			}

			const workColumn = $work?.[column.key];
			const currentColumn = $doc?.[column.key];

			if (isSpatialType(column)) {
				return deepEqual(workColumn, currentColumn);
			}

			if (column.array) {
				return !symmetricDifference(Array.from(workColumn), Array.from(currentColumn)).length;
			}

			if (isRelationship(column)) {
				if (isRelationshipToMany(column)) {
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

		async function update() {
			if (!row || !work) return;

			try {
				const payload = buildPayload(table.fields, $.store_get($$store_subs ??= {}, '$work', work));

				await sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({
					databaseId: table.databaseId,
					tableId: table.$id,
					rowId: row.$id,
					data: payload,
					permissions: $.store_get($$store_subs ??= {}, '$work', work).$permissions
				});

				invalidate(Dependencies.ROW);
				trackEvent(Submit.RowUpdate);
				addNotification({ message: 'Row has been updated', type: 'success' });
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.RowUpdate);
			}
		}

		function focusFirstInput() {
			const firstInput = columnFormWrapper?.querySelector('input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])');

			firstInput?.focus({ preventScroll: true });
		}

		function updateRowData(values) {
			work.set(values);
		}

		if (loading) {
			$$renderer.push(`<!--[0--><div${$.attr_style('', { 'margin-block': '', 'margin-inline-end': '2.25rem' })}>`);
			Skeleton($$renderer, { variant: 'line', height: 40, width: 'auto' });
			$$renderer.push(`<!----></div>`);
		} else if (table.fields?.length && work) {
			$$renderer.push(`<!--[1--><div>`);

			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					direction: 'column',
					gap: 'xl',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(table.fields);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let column = each_array[$$index];
							const label = column.key;

							ColumnItem($$renderer, {
								label,
								editing: true,
								formValues: $.store_get($$store_subs ??= {}, '$work', work),
								column: toRelationalField(column),
								onUpdateFormValues: updateRowData
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

			$$renderer.push(`</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { row, rowId, disabled, update });
	});
}
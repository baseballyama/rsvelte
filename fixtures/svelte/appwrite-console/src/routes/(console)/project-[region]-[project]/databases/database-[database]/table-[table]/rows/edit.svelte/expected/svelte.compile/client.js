import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!></div>`);

export default function Edit($$anchor, $$props) {
	$.push($$props, true);

	const $work = () => $.store_get($.get(work), '$work', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let row = $.prop($$props, 'row', 15),
		rowId = $.prop($$props, 'rowId', 15, null),
		autoFocus = $.prop($$props, 'autoFocus', 3, true),
		disabled = $.prop($$props, 'disabled', 15, true);

	let loading = $.state(false);
	let work = $.state(null);
	let columnFormWrapper = $.state(null);

	onMount(() => {
		/* silences the not read error warning */
		disabled();
	});

	function initWork() {
		const filteredKeys = Object.keys(row()).filter((key) => {
			return !PROHIBITED_ROW_KEYS.includes(key);
		});

		const result = filteredKeys.reduce(
			(obj, key) => {
				obj[key] = row()[key];

				return obj;
			},
			{}
		);

		return writable(deepClone(result));
	}

	async function loadRowFromId() {
		if (!rowId()) return;

		$.set(loading, true);

		try {
			row(await sdk.forProject(page.params.region, page.params.project).tablesDB.getRow({
				databaseId: $$props.table.databaseId,
				tableId: $$props.table.$id,
				rowId: rowId(),
				queries: buildWildcardEntitiesQuery($$props.table)
			}));
		} catch(error) {
			addNotification({
				message: `Failed to load row: ${error.message}`,
				type: 'error'
			});

			row(null);
		} finally {
			rowId(null);
			$.set(loading, false);
		}
	}

	$.user_effect(() => {
		if (!row() && rowId()) {
			loadRowFromId();
		}
	});

	$.user_effect(() => {
		if (row()) {
			$.store_unsub($.set(work, initWork(), true), '$work', $$stores);

			if (autoFocus()) {
				requestAnimationFrame(() => focusFirstInput());
			}
		} else {
			$.store_unsub($.set(work, null), '$work', $$stores);
		}
	});

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
		if (!row() || !$.get(work)) return;

		try {
			const payload = buildPayload($$props.table.fields, $work());

			await sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({
				databaseId: $$props.table.databaseId,
				tableId: $$props.table.$id,
				rowId: row().$id,
				data: payload,
				permissions: $work().$permissions
			});

			invalidate(Dependencies.ROW);
			trackEvent(Submit.RowUpdate);
			addNotification({ message: 'Row has been updated', type: 'success' });
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.RowUpdate);
		}
	}

	$.user_effect(() => {
		if (!$.get(work) || !row() || !$$props.table?.fields?.length) {
			disabled(true);

			return;
		}

		disabled($$props.table.fields.every((column) => compareColumns(column, $work(), row())));
	});

	function focusFirstInput() {
		const firstInput = $.get(columnFormWrapper)?.querySelector('input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])');

		firstInput?.focus({ preventScroll: true });
	}

	function updateRowData(values) {
		$.get(work).set(values);
	}

	var $$exports = { update };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.set_style(div, '', {}, { 'margin-block': '', 'margin-inline-end': '2.25rem' });

			var node_1 = $.child(div);

			Skeleton(node_1, { variant: 'line', height: 40, width: 'auto' });
			$.reset(div);
			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			var div_1 = root();
			var node_2 = $.child(div_1);

			$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'column',
					gap: 'xl',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.each(node_3, 17, () => $$props.table.fields, $.index, ($$anchor, column) => {
							const label = $.derived(() => $.get(column).key);

							{
								let $0 = $.derived(() => toRelationalField($.get(column)));

								ColumnItem($$anchor, {
									get label() {
										return $.get(label);
									},
									editing: true,
									get formValues() {
										return $work();
									},

									get column() {
										return $.get($0);
									},
									onUpdateFormValues: updateRowData
								});
							}
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(columnFormWrapper, $$value), () => $.get(columnFormWrapper));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else if ($$props.table.fields?.length && $.get(work)) $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}
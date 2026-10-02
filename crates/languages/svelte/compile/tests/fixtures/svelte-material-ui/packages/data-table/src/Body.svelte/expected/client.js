import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext, getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'children'
]);

var root = $.from_html(`<tbody><!></tbody>`);

export default function Body($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let rows = [];
	const rowAccessorMap = new WeakMap();

	setContext('SMUI:data-table:row:header', false);

	setContext('SMUI:data-table:row:mount', (accessor) => {
		rows.push(accessor);
		rowAccessorMap.set(accessor.element, accessor);
	});

	setContext('SMUI:data-table:row:unmount', (accessor) => {
		const idx = rows.findIndex((a) => a === accessor);

		if (idx !== -1) {
			rows.splice(idx, 1);
		}

		rowAccessorMap.delete(accessor.element);
	});

	const SMUIDataTableBodyMount = getContext('SMUI:data-table:body:mount');
	const SMUIDataTableBodyUnmount = getContext('SMUI:data-table:body:unmount');

	onMount(() => {
		const accessor = {
			get rows() {
				return rows;
			},

			get orderedRows() {
				return getOrderedRows();
			}
		};

		SMUIDataTableBodyMount && SMUIDataTableBodyMount(accessor);

		return () => {
			SMUIDataTableBodyUnmount && SMUIDataTableBodyUnmount(accessor);
		};
	});

	function getOrderedRows() {
		return [...getElement().querySelectorAll('.mdc-data-table__row')].map((element) => rowAccessorMap.get(element)).filter((accessor) => accessor && accessor._smui_data_table_row_accessor);
	}

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var tbody = root();

	$.attribute_effect(tbody, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({ 'mdc-data-table__content': true, [className()]: true })
	]);

	var node = $.child(tbody);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(tbody);
	$.bind_this(tbody, ($$value) => element = $$value, () => element);
	$.action(tbody, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, tbody);

	return $.pop($$exports);
}
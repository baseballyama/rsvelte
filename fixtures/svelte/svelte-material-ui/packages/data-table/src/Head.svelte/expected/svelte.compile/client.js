import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext, getContext } from 'svelte';
import { useActions } from '@smui/common/internal';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'use', 'children']);
var root = $.from_html(`<thead><!></thead>`);

export default function Head($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let checkbox = $.state(void 0);
	let cells = [];
	const cellAccessorMap = new WeakMap();

	setContext('SMUI:data-table:row:header', true);

	const SMUICheckboxMount = getContext('SMUI:checkbox:mount');

	setContext('SMUI:checkbox:mount', (accessor) => {
		$.set(checkbox, accessor, true);
		SMUICheckboxMount && SMUICheckboxMount(accessor);
	});

	const SMUICheckboxUnount = getContext('SMUI:checkbox:unmount');

	setContext('SMUI:checkbox:unmount', (accessor) => {
		$.set(checkbox, undefined);
		SMUICheckboxUnount && SMUICheckboxUnount(accessor);
	});

	setContext('SMUI:data-table:cell:mount', (accessor) => {
		cells.push(accessor);
		cellAccessorMap.set(accessor.element, accessor);
	});

	setContext('SMUI:data-table:cell:unmount', (accessor) => {
		const idx = cells.findIndex((a) => a === accessor);

		if (idx !== -1) {
			cells.splice(idx, 1);
		}

		cellAccessorMap.delete(accessor.element);
	});

	const SMUIDataTableHeaderMount = getContext('SMUI:data-table:header:mount');
	const SMUIDataTableHeaderUnmount = getContext('SMUI:data-table:header:unmount');

	onMount(() => {
		const accessor = {
			get cells() {
				return cells;
			},

			get orderedCells() {
				return getOrderedCells();
			},

			get checkbox() {
				return $.get(checkbox);
			}
		};

		SMUIDataTableHeaderMount && SMUIDataTableHeaderMount(accessor);

		return () => {
			SMUIDataTableHeaderUnmount && SMUIDataTableHeaderUnmount(accessor);
		};
	});

	function getOrderedCells() {
		return [
			...getElement().querySelectorAll('.mdc-data-table__header-cell')
		].map((element) => cellAccessorMap.get(element)).filter((accessor) => accessor && accessor._smui_data_table_header_cell_accessor);
	}

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var thead = root();

	$.attribute_effect(thead, () => ({ ...restProps }));

	var node = $.child(thead);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(thead);
	$.bind_this(thead, ($$value) => element = $$value, () => element);
	$.action(thead, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, thead);

	return $.pop($$exports);
}
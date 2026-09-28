import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext, setContext } from 'svelte';
import { classMap, useActions, dispatch } from '@smui/common/internal';

let counter = 0;

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'numeric',
	'checkbox',
	'columnId',
	'sortable',
	'children'
]);

var root = $.from_html(`<div class="mdc-data-table__header-cell-wrapper"><!> <div class="mdc-data-table__sort-status-label" aria-hidden="true"> </div></div>`);
var root_1 = $.from_html(`<th><!></th>`);
var root_2 = $.from_html(`<td><!></td>`);

export default function Cell($$anchor, $$props) {
	$.push($$props, true);

	const $sort = () => $.store_get(sort, '$sort', $$stores);
	const $sortDirection = () => $.store_get(sortDirection, '$sortDirection', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let header = getContext('SMUI:data-table:row:header');

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Whether to apply numeric column styling.
	 */
	/**
	 * Whether this cell contains the checkbox to select.
	 */
	/**
	 * The column ID for the column this cell is a header for.
	 *
	 * You only need this on sortable columns and you only need to put it on the
	 * cell in the header.
	 */
	/**
	 * Whether sorting is enabled on the column this cell is a header for.
	 *
	 * This will default to true if the data table is sortable.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		numeric = $.prop($$props, 'numeric', 3, false),
		checkbox = $.prop($$props, 'checkbox', 3, false),
		columnId = $.prop($$props, 'columnId', 19, () => header
			? 'SMUI-data-table-column-' + counter++
			: 'SMUI-data-table-unused'),
		sortable = $.prop($$props, 'sortable', 19, () => getContext('SMUI:data-table:sortable')),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let internalClasses = $.proxy({});
	let internalAttrs = $.proxy({});
	let sort = getContext('SMUI:data-table:sort');
	let sortDirection = getContext('SMUI:data-table:sortDirection');
	let sortAscendingAriaLabel = getContext('SMUI:data-table:sortAscendingAriaLabel');
	let sortDescendingAriaLabel = getContext('SMUI:data-table:sortDescendingAriaLabel');

	if (sortable()) {
		setContext('SMUI:label:context', 'data-table:sortable-header-cell');
		setContext('SMUI:icon-button:context', 'data-table:sortable-header-cell');
		setContext('SMUI:icon-button:aria-describedby', columnId() + '-status-label');
	}

	const SMUIDataTableCellMount = getContext('SMUI:data-table:cell:mount');
	const SMUIDataTableCellUnmount = getContext('SMUI:data-table:cell:unmount');

	onMount(() => {
		const accessor = header
			? {
				_smui_data_table_header_cell_accessor: true,
				get element() {
					return getElement();
				},

				get columnId() {
					return columnId();
				},
				addClass,
				removeClass,
				getAttr,
				addAttr
			}
			: {
				_smui_data_table_header_cell_accessor: false,
				get element() {
					return getElement();
				},

				get columnId() {
					return undefined;
				},
				addClass,
				removeClass,
				getAttr,
				addAttr
			};

		SMUIDataTableCellMount && SMUIDataTableCellMount(accessor);

		return () => {
			SMUIDataTableCellUnmount && SMUIDataTableCellUnmount(accessor);
		};
	});

	function addClass(className) {
		if (!internalClasses[className]) {
			internalClasses[className] = true;
		}
	}

	function removeClass(className) {
		if (!(className in internalClasses) || internalClasses[className]) {
			internalClasses[className] = false;
		}
	}

	function getAttr(name) {
		return name in internalAttrs
			? internalAttrs[name] ?? null
			: getElement().getAttribute(name);
	}

	function addAttr(name, value) {
		if (internalAttrs[name] !== value) {
			internalAttrs[name] = value;
		}
	}

	function notifyHeaderChange(event) {
		dispatch(getElement(), 'SMUIDataTableHeaderCheckboxChange', event);
	}

	function notifyBodyChange(event) {
		dispatch(getElement(), 'SMUIDataTableBodyCheckboxChange', event);
	}

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var th = root_1();

			var event_handler = (e) => {
				if (checkbox()) {
					notifyHeaderChange(e);
				}

				$$props.onchange?.(e);
			};

			$.attribute_effect(
				th,
				($0) => ({
					class: $0,
					role: 'columnheader',
					scope: 'col',
					'data-column-id': columnId(),
					'aria-sort': sortable()
						? $sort() === columnId() ? $sortDirection() : 'none'
						: undefined,
					...internalAttrs,
					...restProps,
					onchange: event_handler
				}),
				[
					() => classMap({
						'mdc-data-table__header-cell': true,
						'mdc-data-table__header-cell--numeric': numeric(),
						'mdc-data-table__header-cell--checkbox': checkbox(),
						'mdc-data-table__header-cell--with-sort': sortable(),
						'mdc-data-table__header-cell--sorted': sortable() && $sort() === columnId(),
						...internalClasses,
						[className()]: true
					})
				]
			);

			var node_1 = $.child(th);

			{
				var consequent = ($$anchor) => {
					var div = root();
					var node_2 = $.child(div);

					$.snippet(node_2, () => $$props.children ?? $.noop);

					var div_1 = $.sibling(node_2, 2);
					var text = $.only_child(div_1, true);

					$.reset(div);

					$.template_effect(() => {
						$.set_attribute(div_1, 'id', `${columnId() ?? ''}-status-label`);

						$.set_text(text, $sort() === columnId()
							? $sortDirection() === 'ascending' ? sortAscendingAriaLabel : sortDescendingAriaLabel
							: '');
					});

					$.append($$anchor, div);
				};

				var alternate = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					$.snippet(node_3, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if (sortable()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(th);
			$.bind_this(th, ($$value) => element = $$value, () => element);
			$.action(th, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
			$.append($$anchor, th);
		};

		var alternate_1 = ($$anchor) => {
			var td = root_2();

			var event_handler_1 = (e) => {
				if (checkbox()) {
					notifyBodyChange(e);
				}

				$$props.onchange?.(e);
			};

			$.attribute_effect(
				td,
				($0) => ({
					class: $0,
					...internalAttrs,
					...restProps,
					onchange: event_handler_1
				}),
				[
					() => classMap({
						'mdc-data-table__cell': true,
						'mdc-data-table__cell--numeric': numeric(),
						'mdc-data-table__cell--checkbox': checkbox(),
						...internalClasses,
						[className()]: true
					})
				]
			);

			var node_4 = $.child(td);

			$.snippet(node_4, () => $$props.children ?? $.noop);
			$.reset(td);
			$.bind_this(td, ($$value) => element = $$value, () => element);
			$.action(td, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
			$.append($$anchor, td);
		};

		$.if(node, ($$render) => {
			if (header) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}
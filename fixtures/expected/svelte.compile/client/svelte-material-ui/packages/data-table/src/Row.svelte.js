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
	'rowId',
	'children'
]);

var root = $.from_html(`<tr><!></tr>`);

export default function Row($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * An optional unique row ID.
	 *
	 * If none is provided, one will be generated.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		rowId = $.prop($$props, 'rowId', 19, () => 'SMUI-data-table-row-' + counter++),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let checkbox = $.state(void 0);
	let internalClasses = $.proxy({});
	let internalAttrs = $.proxy({});
	let header = getContext('SMUI:data-table:row:header');
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

	const SMUIDataTableRowMount = getContext('SMUI:data-table:row:mount');
	const SMUIDataTableRowUnmount = getContext('SMUI:data-table:row:unmount');

	onMount(() => {
		const accessor = header
			? {
				_smui_data_table_row_accessor: false,
				get element() {
					return getElement();
				},

				get checkbox() {
					return $.get(checkbox);
				},

				get rowId() {
					return undefined;
				},

				get selected() {
					return ($.get(checkbox) && $.get(checkbox).checked) ?? false;
				},
				addClass,
				removeClass,
				getAttr,
				addAttr
			}
			: {
				_smui_data_table_row_accessor: true,
				get element() {
					return getElement();
				},

				get checkbox() {
					return $.get(checkbox);
				},

				get rowId() {
					return rowId();
				},

				get selected() {
					return ($.get(checkbox) && $.get(checkbox).checked) ?? false;
				},
				addClass,
				removeClass,
				getAttr,
				addAttr
			};

		SMUIDataTableRowMount && SMUIDataTableRowMount(accessor);

		return () => {
			SMUIDataTableRowUnmount && SMUIDataTableRowUnmount(accessor);
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

	function notifyHeaderClick(event) {
		dispatch(getElement(), 'SMUIDataTableHeaderClick', event);
	}

	function notifyRowClick(event) {
		dispatch(getElement(), 'SMUIDataTableRowClick', { rowId: rowId(), target: event.target });
	}

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var tr = root();

	var event_handler = (e) => {
		if (header) {
			notifyHeaderClick(e);
		} else {
			notifyRowClick(e);
		}

		$$props.onclick?.(e);
	};

	$.attribute_effect(
		tr,
		($0) => ({
			class: $0,
			'aria-selected': $.get(checkbox)
				? $.get(checkbox).checked ? 'true' : 'false'
				: undefined,
			...internalAttrs,
			...restProps,
			onclick: event_handler
		}),
		[
			() => classMap({
				'mdc-data-table__header-row': header,
				'mdc-data-table__row': !header,
				'mdc-data-table__row--selected': !header && $.get(checkbox) && $.get(checkbox).checked,
				...internalClasses,
				[className()]: true
			})
		]
	);

	var node = $.child(tr);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(tr);
	$.bind_this(tr, ($$value) => element = $$value, () => element);
	$.action(tr, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, tr);

	return $.pop($$exports);
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * An optional unique row ID.
	 *
	 * If none is provided, one will be generated.
	 */
}
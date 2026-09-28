import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePickerRootContext } from '../modules/root-context.js';
import { DatePickerTableCellContext } from '../modules/table-cell-context.js';
import { DatePickerViewContext } from '../modules/view-context.js';
import { splitTableCellProps } from '@zag-js/date-picker';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<td><!></td>`);

export default function Table_cell($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const datePicker = DatePickerRootContext.consume();
	const viewProps = DatePickerViewContext.consume();

	const $$d = $.derived(() => splitTableCellProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		tableCellProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const element = $.derived(() => $.get(componentProps).element),
		children = $.derived(() => $.get(componentProps).children),
		rest = $.derived(() => $.exclude_from_object($.get(componentProps), ['element', 'children']));

	const refinedTableCellProps = $.derived(() => {
		return ({
			day: datePicker().getDayTableCellProps,
			month: datePicker().getMonthTableCellProps,
			year: datePicker().getYearTableCellProps

			// @ts-expect-error number === DateValue
		})[viewProps().view]($.get(tableCellProps));
	});

	const attributes = $.derived(() => mergeProps($.get(refinedTableCellProps), $.get(rest)));

	DatePickerTableCellContext.provide(() => $.get(tableCellProps));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $.get(element), () => $.get(attributes));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var td = root();

			$.attribute_effect(td, () => ({ ...$.get(attributes) }));

			var node_2 = $.child(td);

			$.snippet(node_2, () => $.get(children) ?? $.noop);
			$.reset(td);
			$.append($$anchor, td);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
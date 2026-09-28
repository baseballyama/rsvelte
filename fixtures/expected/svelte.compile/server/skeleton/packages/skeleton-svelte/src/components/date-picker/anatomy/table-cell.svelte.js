import * as $ from 'svelte/internal/server';
import { DatePickerRootContext } from '../modules/root-context.js';
import { DatePickerTableCellContext } from '../modules/table-cell-context.js';
import { DatePickerViewContext } from '../modules/view-context.js';
import { splitTableCellProps } from '@zag-js/date-picker';
import { mergeProps } from '@zag-js/svelte';

export default function Table_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const datePicker = DatePickerRootContext.consume();
		const viewProps = DatePickerViewContext.consume();

		const $$d = $.derived(() => splitTableCellProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			tableCellProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const refinedTableCellProps = $.derived(() => {
			return ({
				day: datePicker().getDayTableCellProps,
				month: datePicker().getMonthTableCellProps,
				year: datePicker().getYearTableCellProps

				// @ts-expect-error number === DateValue
			})[viewProps().view](tableCellProps());
		});

		const attributes = $.derived(() => mergeProps(refinedTableCellProps(), rest()));

		DatePickerTableCellContext.provide(() => tableCellProps());

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><td${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></td>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
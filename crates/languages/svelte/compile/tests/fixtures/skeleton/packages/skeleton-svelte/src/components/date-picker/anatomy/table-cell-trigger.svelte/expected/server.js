import * as $ from 'svelte/internal/server';
import { DatePickerRootContext } from '../modules/root-context.js';
import { DatePickerTableCellContext } from '../modules/table-cell-context.js';
import { DatePickerViewContext } from '../modules/view-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Table_cell_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const datePicker = DatePickerRootContext.consume();
		const viewProps = DatePickerViewContext.consume();
		const tableCellProps = DatePickerTableCellContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const refinedTableCellProps = $.derived(() => {
			return ({
				day: datePicker().getDayTableCellTriggerProps,
				month: datePicker().getMonthTableCellTriggerProps,
				year: datePicker().getYearTableCellTriggerProps

				// @ts-expect-error number === DateValue
			})[viewProps().view](tableCellProps());
		});

		const attributes = $.derived(() => mergeProps(refinedTableCellProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
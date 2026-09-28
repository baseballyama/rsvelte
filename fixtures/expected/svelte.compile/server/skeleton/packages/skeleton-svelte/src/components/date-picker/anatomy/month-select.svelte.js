import * as $ from 'svelte/internal/server';
import { DatePickerRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Month_select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const datePicker = DatePickerRootContext.consume();

		const element = $.derived(() => props.element),
			rest = $.derived(() => $.exclude_from_object(props, ['element']));

		const attributes = $.derived(() => mergeProps(datePicker().getMonthSelectProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			$$renderer.select({ ...attributes() }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(datePicker().getMonths());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let month = each_array[$$index];

					$$renderer.option({ value: month.value }, ($$renderer) => {
						$$renderer.push(`${$.escape(month.label)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}
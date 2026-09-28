import * as $ from 'svelte/internal/server';
import { DatePickerRootContext } from '../modules/root-context.js';
import { splitInputProps } from '@zag-js/date-picker';
import { mergeProps } from '@zag-js/svelte';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const datePicker = DatePickerRootContext.consume();

		const $$d = $.derived(() => splitInputProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			inputProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element']));

		const attributes = $.derived(() => mergeProps(datePicker().getInputProps(inputProps()), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><input${$.attributes({ ...attributes() }, void 0, void 0, void 0, 4)}/>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
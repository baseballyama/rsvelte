import * as $ from 'svelte/internal/server';
import { DatePickerRootContext } from '../modules/root-context.js';
import { DatePickerViewContext } from '../modules/view-context.js';
import { splitViewProps } from '@zag-js/date-picker';
import { mergeProps } from '@zag-js/svelte';

export default function View($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const datePicker = DatePickerRootContext.consume();

		const $$d = $.derived(() => splitViewProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			viewProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const attributes = $.derived(() => mergeProps(datePicker().getViewProps(viewProps()), rest()));

		DatePickerViewContext.provide(() => viewProps());

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
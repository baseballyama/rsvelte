import * as $ from 'svelte/internal/server';
import ChevronLeftIcon from '../../../internal/components/chevron-left.svelte';
import { DatePickerRootContext } from '../modules/root-context.js';
import { DatePickerViewContext } from '../modules/view-context.js';
import { mergeProps } from '@zag-js/svelte';

function chevronLeft($$renderer) {
	ChevronLeftIcon($$renderer, {});
}

export default function Prev_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const datePicker = DatePickerRootContext.consume();
		const viewProps = DatePickerViewContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => $.fallback(props.children, chevronLeft)),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(datePicker().getPrevTriggerProps(viewProps()), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
import * as $ from 'svelte/internal/server';
import { DatePickerRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Range_text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const datePicker = DatePickerRootContext.consume();

		const rangeText = $.derived(() => Array.from(new Set([
			datePicker().visibleRangeText.start,
			datePicker().visibleRangeText.end
		])).join(' - '));

		const element = $.derived(() => props.element),
			children = $.derived(() => $.fallback(props.children, defaultChildren)),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(datePicker().getRangeTextProps(), rest()));

		function defaultChildren($$renderer) {
			$$renderer.push(`<!---->${$.escape(rangeText())}`);
		}

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
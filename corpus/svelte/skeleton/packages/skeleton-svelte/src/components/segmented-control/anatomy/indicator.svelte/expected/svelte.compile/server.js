import * as $ from 'svelte/internal/server';
import { SegmentedControlRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Indicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const segmentedControl = SegmentedControlRootContext.consume();

		const element = $.derived(() => props.element),
			rest = $.derived(() => $.exclude_from_object(props, ['element']));

		const attributes = $.derived(() => mergeProps(segmentedControl().getIndicatorProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...attributes() })}></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
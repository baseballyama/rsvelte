import * as $ from 'svelte/internal/server';
import { ProgressRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Circle_range($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const progress = ProgressRootContext.consume();

		const element = $.derived(() => props.element),
			rest = $.derived(() => $.exclude_from_object(props, ['element']));

		const attributes = $.derived(() => mergeProps(progress().getCircleRangeProps(), { 'stroke-linecap': 'round' }, rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><circle${$.attributes({ ...attributes() }, void 0, void 0, void 0, 3)}></circle>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
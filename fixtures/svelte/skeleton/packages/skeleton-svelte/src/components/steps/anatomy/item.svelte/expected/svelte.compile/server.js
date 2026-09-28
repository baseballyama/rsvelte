import * as $ from 'svelte/internal/server';
import { StepsItemContext } from '../modules/item-context.js';
import { StepsRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const steps = StepsRootContext.consume();

		// @zag-js/steps does not currently provide a splitItemProps function, so manually destructure
		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			index = $.derived(() => props.index),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children', 'index']));

		const itemProps = $.derived(() => ({ index: index() }));
		const attributes = $.derived(() => mergeProps(steps().getItemProps(itemProps()), rest()));

		StepsItemContext.provide(() => itemProps());

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
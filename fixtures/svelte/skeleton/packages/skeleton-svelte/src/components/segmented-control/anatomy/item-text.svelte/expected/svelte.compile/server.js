import * as $ from 'svelte/internal/server';
import { SegmentedControlItemContext } from '../modules/item-context.js';
import { SegmentedControlRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Item_text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const segmentedcontrol = SegmentedControlRootContext.consume();
		const itemProps = SegmentedControlItemContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(segmentedcontrol().getItemTextProps(itemProps()), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
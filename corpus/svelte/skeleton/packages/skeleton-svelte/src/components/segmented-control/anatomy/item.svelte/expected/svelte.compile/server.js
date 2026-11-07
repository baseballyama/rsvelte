import * as $ from 'svelte/internal/server';
import { SegmentedControlItemContext } from '../modules/item-context.js';
import { SegmentedControlRootContext } from '../modules/root-context.js';
import { splitItemProps } from '@zag-js/radio-group';
import { mergeProps } from '@zag-js/svelte';

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const segmentedControl = SegmentedControlRootContext.consume();

		const $$d = $.derived(() => splitItemProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			itemProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const attributes = $.derived(() => mergeProps(segmentedControl().getItemProps(itemProps()), rest()));

		SegmentedControlItemContext.provide(() => itemProps());

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><label${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></label>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
import * as $ from 'svelte/internal/server';
import { SegmentedControlItemContext } from '../modules/item-context.js';
import { SegmentedControlRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Item_hidden_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const segmentedcontrol = SegmentedControlRootContext.consume();
		const itemProps = SegmentedControlItemContext.consume();

		const element = $.derived(() => props.element),
			rest = $.derived(() => $.exclude_from_object(props, ['element']));

		const attributes = $.derived(() => mergeProps(segmentedcontrol().getItemHiddenInputProps(itemProps()), rest()));

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
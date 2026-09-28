import * as $ from 'svelte/internal/server';
import Check from '../../../internal/components/check.svelte';
import { ListboxItemContext } from '../modules/item-context.js';
import { ListboxRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

function check($$renderer) {
	Check($$renderer, { class: 'size-4' });
}

export default function Item_indicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const listbox = ListboxRootContext.consume();
		const itemProps = ListboxItemContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => $.fallback(props.children, check)),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(listbox().getItemIndicatorProps(itemProps()), rest()));

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
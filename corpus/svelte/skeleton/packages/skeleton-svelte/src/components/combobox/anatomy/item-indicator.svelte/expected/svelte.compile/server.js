import * as $ from 'svelte/internal/server';
import Check from '../../../internal/components/check.svelte';
import { ComboboxItemContext } from '../modules/item-context.js';
import { ComboboxRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

function check($$renderer) {
	Check($$renderer, { class: 'size-4' });
}

export default function Item_indicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const combobox = ComboboxRootContext.consume();
		const itemProps = ComboboxItemContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => $.fallback(props.children, check)),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(combobox().getItemIndicatorProps(itemProps()), rest()));

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
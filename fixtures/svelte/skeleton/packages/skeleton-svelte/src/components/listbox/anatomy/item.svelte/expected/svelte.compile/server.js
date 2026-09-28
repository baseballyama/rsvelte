import * as $ from 'svelte/internal/server';
import { ListboxItemContext } from '../modules/item-context.js';
import { ListboxRootContext } from '../modules/root-context.js';
import { splitItemProps } from '@zag-js/listbox';
import { mergeProps } from '@zag-js/svelte';

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const listbox = ListboxRootContext.consume();

		const $$d = $.derived(() => splitItemProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			itemProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const attributes = $.derived(() => mergeProps(listbox().getItemProps(itemProps()), rest()));

		ListboxItemContext.provide(() => itemProps());

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><li${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></li>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
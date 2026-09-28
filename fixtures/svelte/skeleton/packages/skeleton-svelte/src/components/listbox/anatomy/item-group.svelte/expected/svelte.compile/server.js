import * as $ from 'svelte/internal/server';
import { ListboxItemGroupContext } from '../modules/item-group-context.js';
import { ListboxRootContext } from '../modules/root-context.js';
import { splitItemGroupProps } from '@zag-js/listbox';
import { mergeProps } from '@zag-js/svelte';

export default function Item_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const { $$slots, $$events, ...props } = $$props;
		const listbox = ListboxRootContext.consume();

		const $$d = $.derived(() => splitItemGroupProps({ id, ...props })),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			itemGroupProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const attributes = $.derived(() => mergeProps(listbox().getItemGroupProps(itemGroupProps()), rest()));

		ListboxItemGroupContext.provide(() => itemGroupProps());

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
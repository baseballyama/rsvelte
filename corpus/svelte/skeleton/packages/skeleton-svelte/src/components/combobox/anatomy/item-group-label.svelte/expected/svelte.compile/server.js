import * as $ from 'svelte/internal/server';
import { ComboboxItemGroupContext } from '../modules/item-group-context.js';
import { ComboboxRootContext } from '../modules/root-context.js';
import { splitItemGroupLabelProps } from '@zag-js/combobox';
import { mergeProps } from '@zag-js/svelte';

export default function Item_group_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const combobox = ComboboxRootContext.consume();
		const itemGroupProps = ComboboxItemGroupContext.consume();

		const $$d = $.derived(() => splitItemGroupLabelProps({ htmlFor: itemGroupProps().id, ...props })),
			$$derived_array = $.derived(() => $.to_array($$d(), 1)),
			itemGroupLabelProps = $.derived(() => $$derived_array()[0]);

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(combobox().getItemGroupLabelProps(itemGroupLabelProps()), rest()));

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
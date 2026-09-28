import * as $ from 'svelte/internal/server';
import { MenuItemContext } from '../modules/item-context.js';
import { MenuRootContext } from '../modules/root-context.js';
import { splitOptionItemProps } from '@zag-js/menu';
import { mergeProps } from '@zag-js/svelte';

export default function Option_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const menu = MenuRootContext.consume();

		const $$d = $.derived(() => splitOptionItemProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			itemProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const attributes = $.derived(() => mergeProps(menu().getOptionItemProps(itemProps()), rest()));

		MenuItemContext.provide(() => itemProps());

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
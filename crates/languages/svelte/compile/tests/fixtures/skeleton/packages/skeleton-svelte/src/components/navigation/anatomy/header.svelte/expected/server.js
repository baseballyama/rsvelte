import * as $ from 'svelte/internal/server';
import { NavigationRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const navigation = NavigationRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(
			{
				'data-scope': 'navigation',
				'data-part': 'header',
				'data-layout': navigation().layout
			},
			rest()
		));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><header${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></header>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
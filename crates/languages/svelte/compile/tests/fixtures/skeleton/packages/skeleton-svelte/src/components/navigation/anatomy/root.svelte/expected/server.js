import * as $ from 'svelte/internal/server';
import { NavigationRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';
import { LocaleProviderRootContext } from '../../locale-provider/modules/root-context.js';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const locale = LocaleProviderRootContext.consume();

		const layout = $.derived(() => $.fallback(props.layout, 'bar')),
			element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['layout', 'element', 'children']));

		const attributes = $.derived(() => mergeProps(
			{
				dir: locale().dir,
				'data-scope': 'navigation',
				'data-part': 'root',
				'data-layout': layout()
			},
			rest()
		));

		NavigationRootContext.provide(() => ({ layout: layout() }));

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
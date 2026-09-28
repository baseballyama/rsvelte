import * as $ from 'svelte/internal/server';
import { LocaleProviderRootContext } from '../../locale-provider/modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const locale = LocaleProviderRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(
			{
				dir: locale().dir,
				'data-scope': 'app-bar',
				'data-part': 'root'
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
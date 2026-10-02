import * as $ from 'svelte/internal/server';
import { MenuRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const menu = MenuRootContext.consume();

		const element = $.derived(() => props.element),
			rest = $.derived(() => $.exclude_from_object(props, ['element']));

		const attributes = $.derived(() => mergeProps(menu().getSeparatorProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><hr${$.attributes({ ...attributes() })}/>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
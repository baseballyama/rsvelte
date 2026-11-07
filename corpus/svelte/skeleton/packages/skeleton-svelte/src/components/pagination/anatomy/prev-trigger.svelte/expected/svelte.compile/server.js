import * as $ from 'svelte/internal/server';
import { PaginationRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Prev_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const pagination = PaginationRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(pagination().getPrevTriggerProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
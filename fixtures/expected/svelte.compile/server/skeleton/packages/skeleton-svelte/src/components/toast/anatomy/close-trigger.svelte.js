import * as $ from 'svelte/internal/server';
import X from '../../../internal/components/x.svelte';
import { ToastRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

function x($$renderer) {
	X($$renderer, {});
}

export default function Close_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const toast = ToastRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => $.fallback(props.children, x)),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(toast().getCloseTriggerProps(), rest()));

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
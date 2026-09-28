import * as $ from 'svelte/internal/server';
import { AvatarRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Fallback($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const avatar = AvatarRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(avatar().getFallbackProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
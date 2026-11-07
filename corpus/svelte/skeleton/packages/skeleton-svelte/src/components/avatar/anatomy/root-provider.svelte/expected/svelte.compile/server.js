import * as $ from 'svelte/internal/server';
import { AvatarRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Root_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			avatar = $.derived(() => props.value),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children', 'value']));

		const attributes = $.derived(() => mergeProps(avatar()().getRootProps(), rest()));

		AvatarRootContext.provide(() => avatar()());

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
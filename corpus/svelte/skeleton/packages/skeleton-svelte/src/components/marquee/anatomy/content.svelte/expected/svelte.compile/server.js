import * as $ from 'svelte/internal/server';
import { MarqueeRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const marquee = MarqueeRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			index = $.derived(() => props.index),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children', 'index']));

		const attributes = $.derived(() => mergeProps(marquee().getContentProps({ index: index() }), rest()));

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
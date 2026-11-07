import * as $ from 'svelte/internal/server';
import { MarqueeRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Edge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const marquee = MarqueeRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			side = $.derived(() => props.side),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children', 'side']));

		const attributes = $.derived(() => mergeProps(marquee().getEdgeProps({ side: side() }), rest()));

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
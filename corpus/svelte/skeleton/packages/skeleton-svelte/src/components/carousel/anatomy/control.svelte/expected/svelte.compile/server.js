import * as $ from 'svelte/internal/server';
import { CarouselRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Control($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const carousel = CarouselRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(carousel().getControlProps(), rest()));

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
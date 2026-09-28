import * as $ from 'svelte/internal/server';
import { CarouselRootContext } from '../modules/root-context.js';
import { splitIndicatorProps } from '@zag-js/carousel';
import { mergeProps } from '@zag-js/svelte';

export default function Indicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const carousel = CarouselRootContext.consume();

		const $$d = $.derived(() => splitIndicatorProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			indicatorProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const attributes = $.derived(() => mergeProps(carousel().getIndicatorProps(indicatorProps()), rest()));

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
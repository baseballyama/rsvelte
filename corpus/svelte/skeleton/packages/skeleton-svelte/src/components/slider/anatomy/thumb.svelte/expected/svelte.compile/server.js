import * as $ from 'svelte/internal/server';
import { SliderRootContext } from '../modules/root-context.js';
import { SliderThumbContext } from '../modules/thumb-context.js';
import { mergeProps } from '@zag-js/svelte';
import { splitThumbProps } from '@zag-js/slider';

export default function Thumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const slider = SliderRootContext.consume();

		const $$d = $.derived(() => splitThumbProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			thumbProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const attributes = $.derived(() => mergeProps(slider().getThumbProps(thumbProps()), rest()));

		SliderThumbContext.provide(() => thumbProps());

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
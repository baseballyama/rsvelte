import * as $ from 'svelte/internal/server';
import { SliderRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Marker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const slider = SliderRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			value = $.derived(() => props.value),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children', 'value']));

		const attributes = $.derived(() => mergeProps(slider().getMarkerProps({ value: value() }), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...attributes() })}>`);

			if (children()) {
				$$renderer.push('<!--[0-->');
				children()($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(value())}`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
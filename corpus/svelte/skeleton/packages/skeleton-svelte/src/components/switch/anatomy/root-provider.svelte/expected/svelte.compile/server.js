import * as $ from 'svelte/internal/server';
import { SwitchRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Root_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			switch_ = $.derived(() => props.value),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children', 'value']));

		const attributes = $.derived(() => mergeProps(switch_()().getRootProps(), rest()));

		SwitchRootContext.provide(() => switch_()());

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><label${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></label>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
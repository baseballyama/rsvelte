import * as $ from 'svelte/internal/server';
import { ProgressRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Circle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const progress = ProgressRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(progress().getCircleProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><svg${$.attributes({ ...attributes() }, void 0, void 0, void 0, 3)}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></svg>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
import * as $ from 'svelte/internal/server';
import { ProgressRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Value_text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const progress = ProgressRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(progress().getValueTextProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...attributes() })}>`);

			if (children()) {
				$$renderer.push('<!--[0-->');
				children()?.($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(progress().percentAsString)}`);
			}

			$$renderer.push(`<!--]--></span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
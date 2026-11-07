import * as $ from 'svelte/internal/server';
import { DialogRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Backdrop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const dialog = DialogRootContext.consume();

		const element = $.derived(() => props.element),
			rest = $.derived(() => $.exclude_from_object(props, ['element']));

		const attributes = $.derived(() => mergeProps(dialog().getBackdropProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...attributes() })}></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
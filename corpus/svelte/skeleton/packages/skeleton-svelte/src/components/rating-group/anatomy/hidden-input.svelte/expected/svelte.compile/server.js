import * as $ from 'svelte/internal/server';
import { RatingGroupRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Hidden_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const ratingGroup = RatingGroupRootContext.consume();

		const element = $.derived(() => props.element),
			rest = $.derived(() => $.exclude_from_object(props, ['element']));

		const attributes = $.derived(() => mergeProps(ratingGroup().getHiddenInputProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><input${$.attributes({ ...attributes() }, void 0, void 0, void 0, 4)}/>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
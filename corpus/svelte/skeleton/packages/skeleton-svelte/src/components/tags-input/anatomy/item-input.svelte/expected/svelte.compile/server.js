import * as $ from 'svelte/internal/server';
import { TagsInputItemContext } from '../modules/item-context.js';
import { TagsInputRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Item_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const tagsInput = TagsInputRootContext.consume();
		const itemProps = TagsInputItemContext.consume();

		const element = $.derived(() => props.element),
			rest = $.derived(() => $.exclude_from_object(props, ['element']));

		const attributes = $.derived(() => mergeProps(tagsInput().getItemInputProps(itemProps()), rest()));

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
import * as $ from 'svelte/internal/server';
import { FileUploadItemContext } from '../modules/item-context.js';
import { FileUploadRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

function times($$renderer) {
	$$renderer.push(`<!---->×`);
}

export default function Item_delete_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const fileUpload = FileUploadRootContext.consume();
		const itemProps = FileUploadItemContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => $.fallback(props.children, times)),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(fileUpload().getItemDeleteTriggerProps(itemProps()), rest()));

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
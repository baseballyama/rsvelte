import * as $ from 'svelte/internal/server';
import { TagsInputRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const tagsInput = TagsInputRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, tagsInput);
		$$renderer.push(`<!---->`);
	});
}
import * as $ from 'svelte/internal/server';
import { ListboxRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const listbox = ListboxRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, listbox);
		$$renderer.push(`<!---->`);
	});
}
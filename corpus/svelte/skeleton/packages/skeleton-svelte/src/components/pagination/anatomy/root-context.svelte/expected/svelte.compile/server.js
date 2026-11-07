import * as $ from 'svelte/internal/server';
import { PaginationRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const pagination = PaginationRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, pagination);
		$$renderer.push(`<!---->`);
	});
}
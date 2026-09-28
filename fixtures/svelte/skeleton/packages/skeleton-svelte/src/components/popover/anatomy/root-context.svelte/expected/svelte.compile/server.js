import * as $ from 'svelte/internal/server';
import { PopoverRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const popover = PopoverRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, popover);
		$$renderer.push(`<!---->`);
	});
}
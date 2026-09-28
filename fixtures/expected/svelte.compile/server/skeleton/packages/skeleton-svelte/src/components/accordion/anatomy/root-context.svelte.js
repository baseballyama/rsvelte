import * as $ from 'svelte/internal/server';
import { AccordionRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const accordion = AccordionRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, accordion);
		$$renderer.push(`<!---->`);
	});
}
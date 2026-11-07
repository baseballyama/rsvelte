import * as $ from 'svelte/internal/server';
import { TooltipRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const tooltip = TooltipRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, tooltip);
		$$renderer.push(`<!---->`);
	});
}
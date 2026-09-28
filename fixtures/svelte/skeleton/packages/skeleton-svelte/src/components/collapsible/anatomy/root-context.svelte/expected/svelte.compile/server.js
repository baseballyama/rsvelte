import * as $ from 'svelte/internal/server';
import { CollapsibleRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const collapsible = CollapsibleRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, collapsible);
		$$renderer.push(`<!---->`);
	});
}
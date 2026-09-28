import * as $ from 'svelte/internal/server';
import { ToggleGroupRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const toggleGroup = ToggleGroupRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, toggleGroup);
		$$renderer.push(`<!---->`);
	});
}
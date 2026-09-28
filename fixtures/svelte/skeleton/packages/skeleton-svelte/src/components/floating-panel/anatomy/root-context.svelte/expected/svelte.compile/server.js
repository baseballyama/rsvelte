import * as $ from 'svelte/internal/server';
import { FloatingPanelRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const floatingPanel = FloatingPanelRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, floatingPanel);
		$$renderer.push(`<!---->`);
	});
}
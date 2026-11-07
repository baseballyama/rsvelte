import * as $ from 'svelte/internal/server';
import { TabsRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const tabs = TabsRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, tabs);
		$$renderer.push(`<!---->`);
	});
}
import * as $ from 'svelte/internal/server';
import { ToastRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const toast = ToastRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, toast);
		$$renderer.push(`<!---->`);
	});
}
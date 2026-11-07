import * as $ from 'svelte/internal/server';
import { MenuRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const menu = MenuRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, menu);
		$$renderer.push(`<!---->`);
	});
}
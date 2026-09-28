import * as $ from 'svelte/internal/server';
import { DialogRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const dialog = DialogRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, dialog);
		$$renderer.push(`<!---->`);
	});
}
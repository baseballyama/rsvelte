import * as $ from 'svelte/internal/server';
import { DialogRootContext } from '../modules/root-context.js';

export default function Root_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		const children = $.derived(() => props.children),
			dialog = $.derived(() => props.value);

		DialogRootContext.provide(() => dialog()());
		children()?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}
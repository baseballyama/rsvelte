import * as $ from 'svelte/internal/server';
import { PopoverRootContext } from '../modules/root-context.js';

export default function Root_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		const children = $.derived(() => props.children),
			popover = $.derived(() => props.value);

		PopoverRootContext.provide(() => popover()());
		children()?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}
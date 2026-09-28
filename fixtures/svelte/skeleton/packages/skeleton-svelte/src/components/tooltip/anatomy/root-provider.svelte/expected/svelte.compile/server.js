import * as $ from 'svelte/internal/server';
import { useTooltip } from '../modules/provider.svelte';
import { TooltipRootContext } from '../modules/root-context.js';

export default function Root_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		const children = $.derived(() => props.children),
			tooltip = $.derived(() => props.value);

		TooltipRootContext.provide(() => tooltip()());
		children()?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}
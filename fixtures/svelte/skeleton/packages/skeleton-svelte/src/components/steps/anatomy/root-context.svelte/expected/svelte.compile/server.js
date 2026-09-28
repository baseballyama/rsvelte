import * as $ from 'svelte/internal/server';
import { StepsRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const steps = StepsRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, steps);
		$$renderer.push(`<!---->`);
	});
}
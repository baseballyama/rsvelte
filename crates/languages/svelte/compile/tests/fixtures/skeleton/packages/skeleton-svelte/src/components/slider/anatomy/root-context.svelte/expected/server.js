import * as $ from 'svelte/internal/server';
import { SliderRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const slider = SliderRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, slider);
		$$renderer.push(`<!---->`);
	});
}
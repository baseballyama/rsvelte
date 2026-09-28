import * as $ from 'svelte/internal/server';
import { MarqueeRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const marquee = MarqueeRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, marquee);
		$$renderer.push(`<!---->`);
	});
}
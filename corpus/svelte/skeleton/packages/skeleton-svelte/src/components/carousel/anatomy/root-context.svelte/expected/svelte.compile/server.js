import * as $ from 'svelte/internal/server';
import { CarouselRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const carousel = CarouselRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, carousel);
		$$renderer.push(`<!---->`);
	});
}
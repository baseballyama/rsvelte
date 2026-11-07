import * as $ from 'svelte/internal/server';
import { RatingGroupRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const ratingGroup = RatingGroupRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, ratingGroup);
		$$renderer.push(`<!---->`);
	});
}
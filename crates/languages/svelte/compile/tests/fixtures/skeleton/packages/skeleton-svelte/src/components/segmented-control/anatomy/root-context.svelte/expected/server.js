import * as $ from 'svelte/internal/server';
import { SegmentedControlRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const segmentedControl = SegmentedControlRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, segmentedControl);
		$$renderer.push(`<!---->`);
	});
}
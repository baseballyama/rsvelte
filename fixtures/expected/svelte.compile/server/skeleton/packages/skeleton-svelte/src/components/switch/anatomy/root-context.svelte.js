import * as $ from 'svelte/internal/server';
import { SwitchRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const switch_ = SwitchRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, switch_);
		$$renderer.push(`<!---->`);
	});
}
import * as $ from 'svelte/internal/server';
import { FloatingRootState } from "../use-floating-layer.svelte.js";

export default function Floating_layer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, tooltip = false } = $$props;

		FloatingRootState.create(tooltip);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}
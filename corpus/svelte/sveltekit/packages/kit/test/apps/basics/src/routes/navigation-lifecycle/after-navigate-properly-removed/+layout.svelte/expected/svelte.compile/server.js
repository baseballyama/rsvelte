import * as $ from 'svelte/internal/server';
import { onNavigate } from '$app/navigation';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		onNavigate(() => {
			return () => {};
		});

		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}
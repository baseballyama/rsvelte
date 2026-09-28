import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _layout_($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		$$renderer.push(`<!---->`);

		{
			children($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!---->`);
	});
}
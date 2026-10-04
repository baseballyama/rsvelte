import * as $ from 'svelte/internal/server';

import { Spring } from 'svelte/motion';

export default function Spring_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const size = new Spring(10);
		$$renderer.push(`<p>${$.escape(size.current)}</p>`);
	});
}

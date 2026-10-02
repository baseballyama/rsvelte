import * as $ from 'svelte/internal/server';

import { toDisplayString } from 'vue';

export default function Counter_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let doubled = $.derived(() => count * 2);
		$$renderer.push(`<div class="counter"><button class="dec">-</button><span class="count">${$.escape(toDisplayString(count))}</span><button class="inc">+</button></div><p>doubled: ${$.escape(toDisplayString(doubled()))}</p>`);
	});
}

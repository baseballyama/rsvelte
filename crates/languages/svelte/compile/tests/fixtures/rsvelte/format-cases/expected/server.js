import * as $ from 'svelte/internal/server';

export default function Format_cases($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items, title = 'List' } = $$props;
		let total = $.derived(() => items.length * 2 + 1);
		$$renderer.push(`<section class="list svelte-1ecvz1h"${$.attr('data-count', total())}><h2 class="svelte-1ecvz1h">${$.escape(title)}</h2> `);
		if (items.length > 0) {
			$$renderer.push(`<!--[0--><p>${$.escape(total())} items, the first one is ${$.escape(items[0])} and there is a long tail of text here</p>`);
		} else {
			$$renderer.push(`<!--[-1--><p>none</p>`);
		}
		$$renderer.push(`<!--]--></section>`);
	});
}

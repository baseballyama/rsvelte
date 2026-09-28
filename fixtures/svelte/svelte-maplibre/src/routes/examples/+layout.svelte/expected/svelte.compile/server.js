import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;

		$$renderer.push(`<div class="mx-auto flex w-11/12 flex-col items-center"><h1 class="mb-4">${$.escape($.store_get($$store_subs ??= {}, '$page', page).data.title)}</h1> `);
		children?.($$renderer);
		$$renderer.push(`<!----> <p><a href="/">Back to Examples</a></p> <p><a href="https://github.com/dimfeld/svelte-maplibre">Github</a></p></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
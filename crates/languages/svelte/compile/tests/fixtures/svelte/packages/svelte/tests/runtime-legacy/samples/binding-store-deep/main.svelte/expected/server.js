import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const user = writable({ name: 'world' });

		$$renderer.push(`<input${$.attr('value', $.store_get($$store_subs ??= {}, '$user', user).name)}/> <p>hello ${$.escape($.store_get($$store_subs ??= {}, '$user', user).name)}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { user });
	});
}
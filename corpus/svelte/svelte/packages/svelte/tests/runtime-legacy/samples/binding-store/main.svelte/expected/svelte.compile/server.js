import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const name = writable('world');

		$$renderer.push(`<input${$.attr('value', $.store_get($$store_subs ??= {}, '$name', name))}/> <p>hello ${$.escape($.store_get($$store_subs ??= {}, '$name', name))}</p> <textarea>`);

		const $$body = $.escape($.store_get($$store_subs ??= {}, '$name', name));

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <div contenteditable="true">`);

		const $$body_1 = $.store_get($$store_subs ??= {}, '$name', name);

		if ($$body_1) {
			$$renderer.push(`${$$body_1}`);
		} else {}

		$$renderer.push(`</div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { name });
	});
}
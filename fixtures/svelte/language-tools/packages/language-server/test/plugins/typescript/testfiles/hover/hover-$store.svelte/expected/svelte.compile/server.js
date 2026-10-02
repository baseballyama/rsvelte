import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Hover_$store($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const b = writable('');

		$.store_get($$store_subs ??= {}, '$b', b);

		if (typeof $.store_get($$store_subs ??= {}, '$b', b) === 'string') {
			$.store_get($$store_subs ??= {}, '$b', b);
		}

		b;
		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$b', b))} `);

		if (typeof $.store_get($$store_subs ??= {}, '$b', b) === 'string') {
			$$renderer.push(`<!--[0-->${$.escape($.store_get($$store_subs ??= {}, '$b', b))}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> ${$.escape(b)}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let form = writable(data.form);

		function addTag() {
			$.store_mutate($$store_subs ??= {}, '$form', form, $.store_get($$store_subs ??= {}, '$form', form).data.tags['third'] = 3);
		}

		$$renderer.push(`<pre>${$.escape(JSON.stringify($.store_get($$store_subs ??= {}, '$form', form), null, 2))}</pre> <button>add</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
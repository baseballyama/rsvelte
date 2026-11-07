import * as $ from 'svelte/internal/server';
import { wStore, rStore, dStore, unionStore, storeLike, stores } from '../../ts/store';
import { get } from 'svelte/store';

export default function Ts_test01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, '$wStore', wStore))}</p> <p>${$.escape(get(wStore))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$rStore', rStore))}</p> <p>${$.escape(get(rStore))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$dStore', dStore))}</p> <p>${$.escape(get(dStore))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$unionStore', unionStore))}</p> <p>${$.escape(get(unionStore))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$storeLike', storeLike))}</p> <p>${$.escape(get(storeLike))}</p> <p>${$.escape(get(stores.w))}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
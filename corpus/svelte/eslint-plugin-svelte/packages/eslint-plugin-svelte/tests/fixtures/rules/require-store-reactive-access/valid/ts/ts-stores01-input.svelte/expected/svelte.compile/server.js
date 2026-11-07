import * as $ from 'svelte/internal/server';
import * as stores from '../../ts/store';
import { get } from 'svelte/store';

export default function Ts_stores01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<p>${$.escape(get(stores.wStore))}</p> <p>${$.escape(get(stores.rStore))}</p> <p>${$.escape(get(stores.dStore))}</p> <p>${$.escape(get(stores.unionStore))}</p> <p>${$.escape(get(stores.storeLike))}</p> <p>${$.escape(get(stores.stores.w))}</p>`);
	});
}
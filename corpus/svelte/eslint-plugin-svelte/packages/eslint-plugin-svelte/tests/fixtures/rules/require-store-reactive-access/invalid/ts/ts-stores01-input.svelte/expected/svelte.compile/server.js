import * as $ from 'svelte/internal/server';
import * as stores from '../../ts/store';
import { get } from 'svelte/store';

export default function Ts_stores01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<p>${$.escape(stores.wStore)}</p> <p>${$.escape(stores.rStore)}</p> <p>${$.escape(stores.dStore)}</p> <p>${$.escape(stores.unionStore)}</p> <p>${$.escape(stores.storeLike)}</p> <p>${$.escape(stores.stores.w)}</p>`);
	});
}
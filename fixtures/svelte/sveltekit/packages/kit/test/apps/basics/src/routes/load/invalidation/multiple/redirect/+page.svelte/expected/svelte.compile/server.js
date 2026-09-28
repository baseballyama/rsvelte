import * as $ from 'svelte/internal/server';
import { refreshAll } from '$app/navigation';
import { redirect_state } from '../state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function redirect() {
			redirect_state.set('start');
			refreshAll();
		}

		$$renderer.push(`<button class="redirect">redirect</button> <p class="redirect-state">Redirect state: ${$.escape($.store_get($$store_subs ??= {}, '$redirect_state', redirect_state))}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
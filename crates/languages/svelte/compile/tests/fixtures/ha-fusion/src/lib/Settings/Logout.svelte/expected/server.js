import * as $ from 'svelte/internal/server';
import { openModal, closeModal } from 'svelte-modals';
import Ripple from 'svelte-ripple';
import { lang, ripple } from '$lib/Stores';

export default function Logout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function handleClick() {
			openModal(() => import('$lib/Modal/ConfirmAlert.svelte'), {
				title: $.store_get($$store_subs ??= {}, '$lang', lang)('log_out'),
				message: $.store_get($$store_subs ??= {}, '$lang', lang)('confirm_log_out'),
				confirm: async () => {
					localStorage.removeItem('hassTokens');
					location.reload();
				},

				cancel: () => {
					closeModal();
				}
			});
		}

		$$renderer.push(`<div class="svelte-panqhr"><span><h2>${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('log_out'))}</h2> <p class="svelte-panqhr">${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('auth'))}</p></span> <button class="action remove svelte-panqhr">${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('remove'))}</button></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
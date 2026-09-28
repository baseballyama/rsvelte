import * as $ from 'svelte/internal/server';
import { configuration, lang } from '$lib/Stores';

export default function Token($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let token = $.store_get($$store_subs ??= {}, '$configuration', configuration)?.token;

		function handleFocus(event) {
			const target = event.target;

			target.type = event.type === 'focus' ? 'text' : 'password';
		}

		const href = 'https://www.home-assistant.io/docs/authentication/#your-account-profile';

		$$renderer.push(`<h2>${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('token'))}</h2> <p class="overflow svelte-10okbuk">${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('docs'))} - <a${$.attr('href', href)} target="blank" class="svelte-10okbuk">https://www.home-assistant.io/docs/authentication/#your-account-profile</a></p> <input class="input" type="password" name="token"${$.attr('placeholder', $.store_get($$store_subs ??= {}, '$lang', lang)('token'))}${$.attr('value', token)}/>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
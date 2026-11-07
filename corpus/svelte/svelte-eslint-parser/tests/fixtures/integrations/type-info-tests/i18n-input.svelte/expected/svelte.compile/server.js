import * as $ from 'svelte/internal/server';
import { _ } from './svelte-i18n';

export default function I18n_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<main><input${$.attr('name', $.store_get($$store_subs ??= {}, '$_', _)('test'))}/></main>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
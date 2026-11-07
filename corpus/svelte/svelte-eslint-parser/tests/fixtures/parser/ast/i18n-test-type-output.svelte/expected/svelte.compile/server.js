import * as $ from 'svelte/internal/server';
import { _ } from './i18n-test-svelte-i18n';

export default function I18n_test_type_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<main><input${$.attr(
			'name',
			// _: Readable<MessageFormatter>, _: Readable<MessageFormatter>
			$.store_get($$store_subs ??= {}, '$_', _)('test')
		)}/></main>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
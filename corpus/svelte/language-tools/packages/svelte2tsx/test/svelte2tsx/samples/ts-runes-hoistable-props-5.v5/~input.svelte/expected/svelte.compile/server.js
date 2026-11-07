import * as $ from 'svelte/internal/server';
import { readable } from 'svelte/store';
import X from './X';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = readable(1);

		/** I should not be sandwitched between the imports */
		let { foo } = $$props;

		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$store', store))}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
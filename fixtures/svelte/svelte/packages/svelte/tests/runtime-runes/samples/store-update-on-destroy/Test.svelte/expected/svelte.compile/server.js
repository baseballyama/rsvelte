import * as $ from 'svelte/internal/server';

export default function Test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { store } = $$props;

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
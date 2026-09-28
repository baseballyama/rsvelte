import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get($$props.store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$.user_effect(() => {
		$store();

		return () => {
			console.log($store());
			$.update_store($$props.store, $store());
			console.log($store());
		};
	});

	$.pop();
	$$cleanup();
}
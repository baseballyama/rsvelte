import * as $ from 'svelte/internal/server';
import { devKey } from './store';
import KeyDetails from '../../(components)/keyDetails.svelte';

export default function _page_project__region___project_($$renderer) {
	var $$store_subs;

	KeyDetails($$renderer, {
		key: $.store_get($$store_subs ??= {}, '$devKey', devKey),
		keyType: 'dev'
	});

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}
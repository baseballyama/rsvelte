import * as $ from 'svelte/internal/server';
import { key } from './store';
import KeyDetails from '../../(components)/keyDetails.svelte';

export default function _page_project__region___project_($$renderer) {
	var $$store_subs;

	KeyDetails($$renderer, {
		key: $.store_get($$store_subs ??= {}, '$key', key),
		keyType: 'api'
	});

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}
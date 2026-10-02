import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { key } from './store';
import KeyDetails from '../../(components)/keyDetails.svelte';

export default function _page_project__region___project_($$anchor) {
	const $key = () => $.store_get(key, '$key', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	KeyDetails($$anchor, {
		get key() {
			return $key();
		},
		keyType: 'api'
	});

	$$cleanup();
}
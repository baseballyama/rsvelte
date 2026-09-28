import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { devKey } from './store';
import KeyDetails from '../../(components)/keyDetails.svelte';

export default function _page_project__region___project_($$anchor) {
	const $devKey = () => $.store_get(devKey, '$devKey', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	KeyDetails($$anchor, {
		get key() {
			return $devKey();
		},
		keyType: 'dev'
	});

	$$cleanup();
}
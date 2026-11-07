import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { writable } from 'svelte/store';

export default function CrossfadeProvider($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const noop = () => false;
	const store = getContext('crossfade') || writable({ send: noop, receive: noop });
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(
		node,
		$$props,
		'default',
		{
			get key() {
				return $store().key;
			},

			get send() {
				return $store().send;
			},

			get receive() {
				return $store().receive;
			}
		},
		null
	);

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
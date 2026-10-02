import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toStore } from 'svelte/store';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let count = $.state(0);
	const store = toStore(() => $.get(count), (v) => $.set(count, v, true));

	store.set(1);
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $store()));
	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store1 = () => $.store_get(store1, '$store1', $$stores);
	const $store2 = () => $.store_get(store2, '$store2', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const context = { store1: writable(31), store2: writable(42) };
	let store1;
	let store2;

	({ store1, store2 } = context);
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$store1() ?? ''}
${$store2() ?? ''}`));

	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}
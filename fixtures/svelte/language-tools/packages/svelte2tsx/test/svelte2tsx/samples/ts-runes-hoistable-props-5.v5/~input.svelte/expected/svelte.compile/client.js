import 'svelte/internal/disclose-version';
import X from './X';
import * as $ from 'svelte/internal/client';
import { readable } from 'svelte/store';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = readable(1);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, /** I should not be sandwitched between the imports */
	$store()));

	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}
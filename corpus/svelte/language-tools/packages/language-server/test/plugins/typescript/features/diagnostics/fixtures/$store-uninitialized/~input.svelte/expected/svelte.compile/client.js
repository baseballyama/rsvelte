import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const $data = () => $.store_get(data, '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let data; // Svelte allows the store to be initialized later

	$data();
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $data()));
	$.append($$anchor, text);
	$$cleanup();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';

export default function Ts_unused_in_script_input($$anchor) {
	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $page()));
	$.append($$anchor, text);
	$$cleanup();
}
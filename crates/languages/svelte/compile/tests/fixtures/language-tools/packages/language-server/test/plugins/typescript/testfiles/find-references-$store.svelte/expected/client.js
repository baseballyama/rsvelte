import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export const findMe = writable('');

export default function Find_references_$store($$anchor) {
	const $findMe = () => $.store_get(findMe, '$findMe', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	if ($findMe()) {
		$findMe();
	}

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $findMe()));
	$.append($$anchor, text);
	$$cleanup();
}
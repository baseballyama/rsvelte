import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const page = writable(1);
	const value = $.prop($$props, 'value', 19, $page);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, value()));
	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}
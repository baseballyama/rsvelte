import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $count = () => $.store_get(count, '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const count = writable(0);

	$.store_set(count, $count() + 1);
	$.store_set(count, $count() + 1);
	$.store_set(count, $count() + 1);

	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $count()));
	$.append($$anchor, p);
	$.pop();
	$$cleanup();
}
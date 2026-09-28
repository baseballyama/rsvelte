import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable, derived } from 'svelte/store';

var root = $.from_html(`<p style="position: fixed; top: 1em; left: 1em;"> </p> <div style="height: 9999px"></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $y = () => $.store_get(y, '$y', $$stores);
	const $y_squared = () => $.store_get(y_squared, '$y_squared', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const y = writable(0);
	const y_squared = derived(y, ($y) => $y * $y);
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);

	$.next(2);
	$.template_effect(() => $.set_text(text, `scroll y is ${$y() ?? ''}. ${$y() ?? ''} * ${$y() ?? ''} = ${$y_squared() ?? ''}`));
	$.bind_window_scroll('y', $y, ($$value) => $.store_set(y, $$value));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
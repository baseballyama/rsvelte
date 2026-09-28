import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<div> </div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $foo = () => $.store_get(foo, '$foo', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const foo = writable();
	var div = root();
	var text = $.only_child(div, true);

	$.bind_this(div, ($$value) => $.store_set(foo, $$value), () => $foo());
	$.template_effect(() => $.set_text(text, typeof $foo()));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}
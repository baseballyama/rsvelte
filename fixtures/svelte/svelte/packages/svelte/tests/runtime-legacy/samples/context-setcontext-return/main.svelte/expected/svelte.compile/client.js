import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';

var root = $.from_html(`<div> </div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const a = {};
	const b = setContext('foo', a);
	var div = root();
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, a === b));
	$.append($$anchor, div);
	$.pop();
}
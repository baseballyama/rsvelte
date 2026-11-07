import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<p> </p>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	const num = getContext('test');
	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Context value: ${num ?? ''}`));
	$.append($$anchor, p);
	$.pop();
}
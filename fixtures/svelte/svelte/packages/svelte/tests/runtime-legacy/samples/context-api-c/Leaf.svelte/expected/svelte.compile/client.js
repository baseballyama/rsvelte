import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { hasContext } from 'svelte';

var root = $.from_html(`<div> </div>`);

export default function Leaf($$anchor, $$props) {
	$.push($$props, true);

	const has = hasContext('test');
	var div = root();
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, has));
	$.append($$anchor, div);
	$.pop();
}
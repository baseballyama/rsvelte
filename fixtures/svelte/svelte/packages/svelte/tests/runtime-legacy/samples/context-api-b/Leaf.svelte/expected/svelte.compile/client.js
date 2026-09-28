import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { ID } from './Nested.svelte';

var root = $.from_html(`<div> </div>`);

export default function Leaf($$anchor, $$props) {
	$.push($$props, true);

	const name = getContext('test');
	var div = root();
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, name));
	$.append($$anchor, div);
	$.pop();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div> </div>`);

export default function ChildComponent($$anchor, $$props) {
	$.push($$props, true);

	const value = getContext('foo');
	var div = root();
	var text = $.only_child(div);

	$.template_effect(() => $.set_text(text, `Value in child component: ${value ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}
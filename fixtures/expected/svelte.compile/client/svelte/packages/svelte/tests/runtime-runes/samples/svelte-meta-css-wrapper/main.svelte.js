import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<h1>hello</h1> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <p>goodbye</p>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	{
		$.css_props(node, () => ({ '--color': 'red' }));
		Component(node.lastChild, {});
		$.reset(node);
	}

	$.next(2);
	$.append($$anchor, fragment);
}
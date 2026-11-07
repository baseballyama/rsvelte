import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Widget from './Widget.svelte';

var root = $.from_html(`<div><!></div>`);

export default function Main($$anchor) {
	var div = root();
	var node = $.child(div);

	Widget(node, { foo: 'bar', baz: 42 });
	$.reset(div);
	$.append($$anchor, div);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<div><!></div>`);

export default function Main($$anchor) {
	var div = root();
	var node = $.child(div);

	Nested(node, {});
	$.reset(div);
	$.append($$anchor, div);
}
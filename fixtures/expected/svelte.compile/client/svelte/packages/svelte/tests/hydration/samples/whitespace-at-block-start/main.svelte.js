import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<main><!></main>`);

export default function Main($$anchor) {
	var main = root();
	var node = $.child(main);

	Nested(node, {});
	$.reset(main);
	$.append($$anchor, main);
}
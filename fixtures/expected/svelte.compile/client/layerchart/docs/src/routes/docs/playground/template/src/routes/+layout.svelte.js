import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../app.css';

var root = $.from_html(`<main class="p-4"><!></main>`);

export default function _layout($$anchor, $$props) {
	var main = root();
	var node = $.child(main);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(main);
	$.append($$anchor, main);
}
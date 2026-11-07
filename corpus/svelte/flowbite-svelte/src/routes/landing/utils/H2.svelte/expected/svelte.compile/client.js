import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2 class="text-3xl leading-tight font-extrabold text-gray-900 lg:text-4xl dark:text-white"><!></h2>`);

export default function H2($$anchor, $$props) {
	var h2 = root();
	var node = $.child(h2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h2);
	$.append($$anchor, h2);
}
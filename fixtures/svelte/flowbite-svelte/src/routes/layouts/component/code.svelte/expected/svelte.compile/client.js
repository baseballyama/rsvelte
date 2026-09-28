import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<code class="text-primary-700 dark:text-primary-700 text-sm font-semibold"><!></code>`);

export default function Code($$anchor, $$props) {
	var code = root();
	var node = $.child(code);

	$.snippet(node, () => $$props.children);
	$.reset(code);
	$.append($$anchor, code);
}
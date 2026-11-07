import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="sp-blog-page svelte-lpr308"><!></div>`);

export default function PageLayout($$anchor, $$props) {
	var // Intentionally minimal — content is slotted in from +page.svelte
	div = root();

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
}
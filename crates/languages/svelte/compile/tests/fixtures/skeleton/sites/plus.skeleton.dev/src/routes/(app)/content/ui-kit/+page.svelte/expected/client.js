import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container-page"><p>Now viewing <code class="code">ui-kit</code></p></div>`);

export default function _page($$anchor) {
	var div = root();

	$.append($$anchor, div);
}
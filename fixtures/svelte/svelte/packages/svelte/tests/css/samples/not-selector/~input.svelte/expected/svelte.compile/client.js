import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="foo svelte-19dl7vy">foo</p> <p class="bar svelte-19dl7vy">bar <span class="svelte-19dl7vy">baz</span></p> <span class="svelte-19dl7vy">buzz</span>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}
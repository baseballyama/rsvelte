import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li class="svelte-161e5gh">Foo</li>`);

export default function Input($$anchor) {
	var li = root();

	$.append($$anchor, li);
}
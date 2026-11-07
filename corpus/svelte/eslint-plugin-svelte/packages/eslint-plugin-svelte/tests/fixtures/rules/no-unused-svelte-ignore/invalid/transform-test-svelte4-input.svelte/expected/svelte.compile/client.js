import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img src="https://example.com/img.png"/>  <img src="https://example.com/img.png" alt="Foo"/> <div class="foo svelte-1tiblz"><div class="bar svelte-1tiblz"></div></div>`, 1);

export default function Transform_test_svelte4_input($$anchor) {
	var fragment = root();
	var img = $.first_child(fragment);

	$.autofocus(img, true);
	$.next(4);
	$.append($$anchor, fragment);
}
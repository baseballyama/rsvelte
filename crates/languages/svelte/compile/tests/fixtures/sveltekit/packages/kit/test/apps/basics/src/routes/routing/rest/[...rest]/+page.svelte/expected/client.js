import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1> </h1> <h2> </h2> <a href="/routing/rest/xyz/abc/deep">deep</a> <a href="/routing/rest/xyz/abc">abc</a> <a href="/routing/rest/xyz/abc/def">def</a> <a href="/routing/rest/xyz/abc/def/ghi">ghi</a> <a href="/routing/rest">empty</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	var /** @type {{ data: import('./$types').PageData }} */
	h1 = $.first_child(fragment);

	var text = $.only_child(h1, true);
	var h2 = $.sibling(h1, 2);
	var text_1 = $.only_child(h2, true);

	$.next(10);

	$.template_effect(() => {
		$.set_text(text, page.params.rest);
		$.set_text(text_1, $$props.data.rest);
	});

	$.append($$anchor, fragment);
	$.pop();
}
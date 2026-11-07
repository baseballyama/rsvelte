import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1> </h1> <p> </p> <a href="/load/url-query-param?currentClientState=ABC">ABC</a> <a href="/load/url-query-param?currentClientState=DEF">DEF</a> <hr/> <a href="/load/url-query-param" data-sveltekit-reload="">Reload site</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);

	$.next(8);

	$.template_effect(() => {
		$.set_text(text, `Hello ${page.data.currentClientState ?? '' ?? ''}`);
		$.set_text(text_1, page.data.textFromTheServer);
	});

	$.append($$anchor, fragment);
	$.pop();
}
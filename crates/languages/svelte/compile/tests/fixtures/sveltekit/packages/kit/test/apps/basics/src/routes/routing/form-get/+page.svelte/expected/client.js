import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from '$app/navigation';
import { page } from '$app/state';

var root = $.from_html(`<h1> </h1> <h2> </h2> <h3> </h3> <form><input name="q"/> <button type="submit" name="foo" value="bar">Submit</button></form>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let type = '...';

	afterNavigate((navigation) => {
		type = /** @type {string} */ (navigation.type);
	});

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var h2 = $.sibling(h1, 2);
	var text_1 = $.only_child(h2, true);
	var h3 = $.sibling(h2, 2);
	var text_2 = $.only_child(h3, true);

	$.next(2);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, type);
			$.set_text(text_2, $1);
		},
		[
			() => page.url.searchParams.get('q') ?? '...',
			() => page.url.searchParams.get('foo') ?? '...'
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}
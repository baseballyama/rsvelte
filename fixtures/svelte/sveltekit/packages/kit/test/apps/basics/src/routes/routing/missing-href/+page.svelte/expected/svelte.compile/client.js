import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from '$app/navigation';

var root = $.from_html(`<a data-testid="count"> </a>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let count = 0;

	afterNavigate(() => {
		count += 1;
	});

	var a = root();
	var text = $.only_child(a);

	$.template_effect(() => $.set_text(text, `count: ${count ?? ''}`));
	$.append($$anchor, a);
	$.pop();
}
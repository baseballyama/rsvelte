import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from '$app/navigation';

var root = $.from_html(`<p> </p>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let count = 0;
	let type = '';

	afterNavigate((event) => {
		count += 1;
		type = event.type;
	});

	var p = root();
	var text = $.only_child(p);

	$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} ${count ?? ''}`), [() => type.toString()]);
	$.append($$anchor, p);
	$.pop();
}
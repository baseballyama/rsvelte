import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<p> </p>`);

export default function _page($$anchor) {
	let error = false;

	try {
		console.log(page);
	} catch(e) {
		error = true;
	}

	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `error: ${error ?? ''}`));
	$.append($$anchor, p);
}
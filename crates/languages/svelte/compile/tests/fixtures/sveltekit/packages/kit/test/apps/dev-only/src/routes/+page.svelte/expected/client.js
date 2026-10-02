import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<p> </p> <a href="/optimize-deps">Go to /optimize-deps</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let message = '';

	onMount(() => {
		message = 'hello world!';
	});

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);

	$.next(2);
	$.template_effect(() => $.set_text(text, message));
	$.append($$anchor, fragment);
	$.pop();
}
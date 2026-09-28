import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser, dev } from '$app/env';

var root = $.from_html(`<p> </p>`);

export default function Message($$anchor) {
	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Hello from the ${browser ? 'client' : 'server'} in ${dev ? 'dev' : 'prod'} mode!`));
	$.append($$anchor, p);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';

var root = $.from_html(`<p> </p>`);

export default function Ondestroy_input($$anchor, $$props) {
	$.push($$props, true);

	let seconds = 0;
	const interval = setInterval(() => seconds += 1, 1000);

	onDestroy(() => clearInterval(interval));

	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `The page has been open for
	${seconds ?? ''} ${seconds === 1 ? 'second' : 'seconds'}`));

	$.append($$anchor, p);
	$.pop();
}
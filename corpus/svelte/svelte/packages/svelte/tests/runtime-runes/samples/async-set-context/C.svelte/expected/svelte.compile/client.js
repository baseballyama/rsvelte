import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";

var root = $.from_html(`<p> </p>`);

export default function C($$anchor, $$props) {
	$.push($$props, true);

	let greeting = getContext("greeting");
	let recipient = getContext("recipient");
	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${greeting ?? ''} ${recipient ?? ''}`));
	$.append($$anchor, p);
	$.pop();
}
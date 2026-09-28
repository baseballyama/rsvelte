import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get_translation } from './translations.svelte.js';

var root = $.from_html(`<p> </p>`);

export default function Sub($$anchor, $$props) {
	$.push($$props, true);

	const p0 = $.prop($$props, 'p0', 19, get_translation);
	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `greeting: ${p0() ?? ''}`));
	$.append($$anchor, p);
	$.pop();
}
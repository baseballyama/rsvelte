import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { count } from '../state.js';

var root = $.from_html(`<h1> </h1>`);

export default function _page($$anchor) {
	var h1 = root();
	var text = $.only_child(h1);

	$.template_effect(() => $.set_text(text, `target: ${count ?? ''}`));
	$.append($$anchor, h1);
}
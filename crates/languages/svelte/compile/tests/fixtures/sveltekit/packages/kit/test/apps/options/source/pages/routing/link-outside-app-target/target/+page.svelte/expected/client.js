import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { count } from '../state.js';

var root = $.from_html(`<h2> </h2>`);

export default function _page($$anchor) {
	var h2 = root();
	var text = $.only_child(h2);

	$.template_effect(() => $.set_text(text, `target: ${count ?? ''}`));
	$.append($$anchor, h2);
}
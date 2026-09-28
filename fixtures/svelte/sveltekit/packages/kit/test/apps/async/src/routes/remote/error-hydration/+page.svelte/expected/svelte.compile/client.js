import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { failing } from './data.remote';

var root = $.from_html(`<div id="q-error"> </div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const q = failing();
	var div = root();
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, q.error ? `${q.error.status}: ${q.error.message}` : 'none'));
	$.append($$anchor, div);
	$.pop();
}
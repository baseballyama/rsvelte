import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { live_fail } from './data.remote';

var root = $.from_html(`<div id="live-error"> </div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const q = $.derived(() => live_fail($$props.params.key));
	var div = root();
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, $.get(q).error
		? `${$.get(q).error.status}: ${$.get(q).error.message}`
		: 'none'));

	$.append($$anchor, div);
	$.pop();
}
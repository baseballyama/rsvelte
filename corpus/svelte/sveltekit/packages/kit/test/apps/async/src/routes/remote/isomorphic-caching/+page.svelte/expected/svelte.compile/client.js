import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get_value, get_call_count } from './isomorphic.remote.js';

var root = $.from_html(`<p>call count: <span id="call-count"> </span></p> <button id="await-dedupe">await x3 simultaneously</button> <p>dedupe: <span id="dedupe"> </span></p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let call_count = $.state('-');
	let dedupe_status = $.state('idle');
	var fragment = root();
	var p = $.first_child(fragment);
	var span = $.sibling($.child(p));
	var text = $.only_child(span, true);

	$.reset(p);

	var button = $.sibling(p, 2);
	var p_1 = $.sibling(button, 2);
	var span_1 = $.sibling($.child(p_1));
	var text_1 = $.only_child(span_1, true);

	$.reset(p_1);

	$.template_effect(() => {
		$.set_text(text, $.get(call_count));
		$.set_text(text_1, $.get(dedupe_status));
	});

	$.delegated('click', button, async () => {
		$.set(dedupe_status, 'pending');

		const [a, b, c] = await Promise.all([get_value(), get_value(), get_value()]);

		if (a === b && b === c) {
			$.set(dedupe_status, 'dedupe ok');
		} else {
			$.set(dedupe_status, 'mismatch');
		}

		$.set(call_count, String(await get_call_count()), true);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
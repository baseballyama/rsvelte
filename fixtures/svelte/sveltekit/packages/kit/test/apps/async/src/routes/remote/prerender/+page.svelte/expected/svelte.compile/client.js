import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { prerendered, prerendered_entries, with_read } from './prerender.remote.js';

var root = $.from_html(`<a href="/remote/prerender/whole-page">whole-page</a> <a href="/remote/prerender/functions-only">functions-only</a> <button id="fetch-prerendered"> </button> <button id="fetch-not-prerendered"> </button> <button id="fetch-with-read"> </button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let prerendered_result = $.state(null);
	let live_result = $.state(null);
	let read_result = $.state(null);
	var fragment = root();
	var button = $.sibling($.first_child(fragment), 4);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1, true);
	var button_2 = $.sibling(button_1, 2);
	var text_2 = $.only_child(button_2, true);

	$.template_effect(() => {
		$.set_text(text, $.get(prerendered_result));
		$.set_text(text_1, $.get(live_result));
		$.set_text(text_2, $.get(read_result));
	});

	$.delegated('click', button, async () => $.set(prerendered_result, await prerendered(), true));
	$.delegated('click', button_1, async () => $.set(live_result, await prerendered_entries('d'), true));
	$.delegated('click', button_2, async () => $.set(read_result, await with_read(), true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
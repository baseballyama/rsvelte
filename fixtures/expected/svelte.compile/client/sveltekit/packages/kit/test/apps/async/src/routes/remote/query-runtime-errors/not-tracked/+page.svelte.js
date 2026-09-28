import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get_count } from '../../query-command.remote.js';

var root = $.from_html(`<p id="status"> </p> <p id="result"> </p> <button id="create">create query</button> <button id="await">await query</button> <button id="read-current">read current</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let status = $.state('idle');
	let result = $.state('');
	let stored;

	function get_message(error) {
		return error instanceof Error ? error.message : String(error);
	}

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var button = $.sibling(p_1, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.template_effect(() => {
		$.set_text(text, $.get(status));
		$.set_text(text_1, $.get(result));
	});

	$.delegated('click', button, () => {
		stored = get_count();
		$.set(status, 'query created');
	});

	$.delegated('click', button_1, async () => {
		$.set(result, String(await stored), true);
		$.set(status, 'query awaited');
	});

	$.delegated('click', button_2, async () => {
		try {
			await stored;
			$.set(result, String(stored.current), true);
		} catch(error) {
			$.set(result, get_message(error), true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
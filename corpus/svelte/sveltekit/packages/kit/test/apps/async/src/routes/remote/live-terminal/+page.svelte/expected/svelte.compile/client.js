import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get_value, get_connection_count, trigger } from './data.remote.js';

var root = $.from_html(`<button id="trigger-error">trigger error</button> <button id="trigger-redirect">trigger redirect</button> <button id="trigger-yield">trigger yield</button> <button id="refresh-connections">refresh connections</button> <p id="value"> </p> <p id="error"> </p> <p id="connected"> </p> <p id="done"> </p> <p id="connections"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const live = get_value();
	let connections = $.state('pending');

	async function refresh_connections() {
		$.set(connections, String(await get_connection_count()), true);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var p = $.sibling(button_3, 2);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2, true);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3, true);
	var p_4 = $.sibling(p_3, 2);
	var text_4 = $.only_child(p_4, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, live.current);
			$.set_text(text_1, live.error ? `${live.error.status} ${live.error.message}` : '');
			$.set_text(text_2, $0);
			$.set_text(text_3, $1);
			$.set_text(text_4, $.get(connections));
		},
		[() => String(live.connected), () => String(live.done)]
	);

	$.delegated('click', button, () => trigger('error'));
	$.delegated('click', button_1, () => trigger('redirect'));
	$.delegated('click', button_2, () => trigger('yield'));
	$.delegated('click', button_3, refresh_connections);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
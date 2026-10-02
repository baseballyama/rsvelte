import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from "svelte/store";

var root = $.from_html(`<!> <button>Update</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $roomState = () => $.store_get(roomState, '$roomState', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const roomState = writable({ users: { "gary": { name: "gary", value: 100 } } });
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 1, () => Object.values($roomState().users), (user) => user.name, ($$anchor, user) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(user).value));
		$.append($$anchor, text);
	});

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => $.store_mutate(roomState, $.untrack($roomState).users["gary"].value = 1000, $.untrack($roomState)));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);
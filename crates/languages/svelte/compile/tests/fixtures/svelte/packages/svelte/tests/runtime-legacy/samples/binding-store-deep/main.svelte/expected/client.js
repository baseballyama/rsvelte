import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<input/> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const user = writable({ name: 'world' });
	var $$exports = { user };
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var p = $.sibling(input, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `hello ${$user().name ?? ''}`));
	$.bind_value(input, () => $user().name, ($$value) => $.store_mutate(user, $.untrack($user).name = $$value, $.untrack($user)));
	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}
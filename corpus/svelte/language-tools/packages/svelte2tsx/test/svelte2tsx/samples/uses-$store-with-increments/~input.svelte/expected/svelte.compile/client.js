import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<button>add</button> <button>subtract</button> <button>add</button>`, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $count = () => $.store_get(count, '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const count = writable(0);
	const handler1 = () => $.update_pre_store(count, $count());
	const handler2 = () => $.update_store(count, $count(), -1);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.event('click', button, () => $.update_pre_store(count, $count()));
	$.event('click', button_1, () => $.update_store(count, $count(), -1));
	$.event('click', button_2, () => $.update_store(count, $count()));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<button>add</button> <button>add</button> <button>add</button> <button>add</button>`, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $count = () => $.store_get(count, '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const count = writable(0);
	const handler1 = () => !$count();
	const handler2 = () => +$count();
	const handler3 = () => -$count();
	const handler4 = () => ~$count();
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.event('click', button, () => !$count());
	$.event('click', button_1, () => +$count());
	$.event('click', button_2, () => -$count());
	$.event('click', button_3, () => ~$count());
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
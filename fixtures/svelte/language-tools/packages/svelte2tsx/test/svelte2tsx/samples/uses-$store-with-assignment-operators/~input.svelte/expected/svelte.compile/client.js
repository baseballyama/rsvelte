import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<button>add</button> <button>subtract</button> <button>multiply</button> <button>divide</button> <button>exponent</button> <button>mod</button> <button>leftshift</button> <button>rightshift</button> <button>unsigned rightshift</button> <button>AND</button> <button>XOR</button> <button>OR</button>`, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $count = () => $.store_get(count, '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const count = writable(0);
	let myvar = 42; // to show that this is different from ++ or --
	const handler1 = () => $.store_set(count, $count() + myvar);
	const handler2 = () => $.store_set(count, $count() - myvar);
	const handler3 = () => $.store_set(count, $count() * myvar);
	const handler4 = () => $.store_set(count, $count() / myvar);
	const handler5 = () => $.store_set(count, $count() ** myvar);
	const handler6 = () => $.store_set(count, $count() % myvar);
	const handler7 = () => $.store_set(count, $count() << myvar);
	const handler8 = () => $.store_set(count, $count() >> myvar);
	const handler9 = () => $.store_set(count, $count() >>> myvar);
	const handler10 = () => $.store_set(count, $count() & myvar);
	const handler11 = () => $.store_set(count, $count() ^ myvar);
	const handler12 = () => $.store_set(count, $count() | myvar);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);
	var button_5 = $.sibling(button_4, 2);
	var button_6 = $.sibling(button_5, 2);
	var button_7 = $.sibling(button_6, 2);
	var button_8 = $.sibling(button_7, 2);
	var button_9 = $.sibling(button_8, 2);
	var button_10 = $.sibling(button_9, 2);
	var button_11 = $.sibling(button_10, 2);

	$.event('click', button, () => $.store_set(count, $count() + myvar));
	$.event('click', button_1, () => $.store_set(count, $count() - myvar));
	$.event('click', button_2, () => $.store_set(count, $count() * myvar));
	$.event('click', button_3, () => $.store_set(count, $count() / myvar));
	$.event('click', button_4, () => $.store_set(count, $count() ** myvar));
	$.event('click', button_5, () => $.store_set(count, $count() % myvar));
	$.event('click', button_6, () => $.store_set(count, $count() << myvar));
	$.event('click', button_7, () => $.store_set(count, $count() >> myvar));
	$.event('click', button_8, () => $.store_set(count, $count() >>> myvar));
	$.event('click', button_9, () => $.store_set(count, $count() & myvar));
	$.event('click', button_10, () => $.store_set(count, $count() ^ myvar));
	$.event('click', button_11, () => $.store_set(count, $count() | myvar));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
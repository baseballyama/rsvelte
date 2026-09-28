import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<h1> </h1> <button>+1</button> <button>reset</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $foo = () => $.store_get(foo, '$foo', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let foo = writable(0);
	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var button = $.sibling(h1, 2);
	var button_1 = $.sibling(button, 2);

	$.template_effect(() => $.set_text(text, $foo()));
	$.event('click', button, () => foo.update((n) => n + 1));
	$.event('click', button_1, () => foo = writable(0));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<button> </button> <button>click handler marks foo as reactive</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $foo = () => $.store_get(foo, '$foo', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let { foo, toggleFoo } = (() => {
		const foo = writable(false);

		return { foo, toggleFoo: () => foo.update((f) => !f) };
	})();

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);

	$.template_effect(() => $.set_text(text, $foo()));
	$.event('click', button, toggleFoo);
	$.event('click', button_1, () => foo = null);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
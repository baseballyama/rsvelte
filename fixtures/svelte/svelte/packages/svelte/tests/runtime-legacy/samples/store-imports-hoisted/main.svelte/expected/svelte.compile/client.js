import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import foo from './foo.js';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $foo = () => $.store_get(foo, '$foo', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	foo.bar = 'baz';

	const answer = $foo();
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, answer));
	$.append($$anchor, p);
	$.pop();
	$$cleanup();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let name = 'bar';

	function foo() {
		name = 'foo';
	}

	function bar() {
		name = 'bar';
	}

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, name));

	$.event('click', button, function (...$$args) {
		(name === 'bar' ? foo : bar)?.apply(this, $$args);
	});

	$.append($$anchor, button);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const foo = ($$anchor, o = $.noop) => {
	var button = root();

	$.event('click', button, function (...$$args) {
		o().onclick?.apply(this, $$args);
	});

	$.append($$anchor, button);
};

var root = $.from_html(`<button>Click me</button>`);

export default function Ts_snippet03_input($$anchor) {
	function hello() {
		console.log('Hello');
	}

	foo($$anchor, () => ({ onclick: hello }));
}
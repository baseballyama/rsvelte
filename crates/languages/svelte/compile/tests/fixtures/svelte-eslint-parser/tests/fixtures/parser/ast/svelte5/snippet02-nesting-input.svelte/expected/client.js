import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from '$lib/foo.svelte';

const foo = ($$anchor) => {
	const bar = ($$anchor) => {
		$.next();

		var text = $.text('Bar');

		$.append($$anchor, text);
	};

	$.next();

	var fragment = root();
	var node = $.sibling($.first_child(fragment));

	bar(node);
	$.append($$anchor, fragment);
};

var root = $.from_html(`Foo <!>`, 1);

export default function Snippet02_nesting_input($$anchor) {
	Foo($$anchor, {
		get foo() {
			return foo;
		}
	});
}
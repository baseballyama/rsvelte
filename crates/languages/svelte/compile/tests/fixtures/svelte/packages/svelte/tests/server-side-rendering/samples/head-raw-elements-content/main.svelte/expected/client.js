import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>bar</div> <div>bar</div>`, 1);

export default function Main($$anchor) {
	const dynamic_value = 'bar';
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_class(div, 1, 'bar baz svelte-1iut2mq');

	var div_1 = $.sibling(div, 2);

	$.set_class(div_1, 1, 'foo bar baz svelte-1iut2mq');
	$.append($$anchor, fragment);
}
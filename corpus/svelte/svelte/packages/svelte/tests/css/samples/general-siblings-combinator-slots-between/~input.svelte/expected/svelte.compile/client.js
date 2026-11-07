import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="svelte-1fx24xx">Span 1</span>`);
var root_1 = $.from_html(`<span class="svelte-1fx24xx">Span 2</span>`);
var root_2 = $.from_html(`<h1 class="svelte-1fx24xx">Heading 1</h1> <!> <!> <p class="svelte-1fx24xx">Paragraph 2</p>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 2);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var span = root();

		$.append($$anchor, span);
	});

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'default', {}, ($$anchor) => {
		var span_1 = root_1();

		$.append($$anchor, span_1);
	});

	$.next(2);
	$.append($$anchor, fragment);
}
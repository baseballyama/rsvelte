import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-1psur7u">Paragraph 2</p>`);
var root_1 = $.from_html(`<h1 class="svelte-1psur7u">Heading 1</h1> <span>Span 1</span> <span>Span 2</span> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 6);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var p = root();

		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-9oquys">Heading 1</h1>`);
var root_1 = $.from_html(`<!> <span>Span 1</span> <span>Span 2</span> <p class="svelte-9oquys">Paragraph 2</p>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var h1 = root();

		$.append($$anchor, h1);
	});

	$.next(6);
	$.append($$anchor, fragment);
}
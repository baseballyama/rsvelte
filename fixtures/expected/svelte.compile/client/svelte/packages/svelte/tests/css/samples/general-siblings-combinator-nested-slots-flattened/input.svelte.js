import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-1s3aw2q">Heading 1</h1>`);
var root_1 = $.from_html(`<p class="svelte-1s3aw2q">Paragraph 2</p>`);
var root_2 = $.from_html(`<!><span>Span 1</span><span>Span 2</span><!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.slot(node_1, $$props, 'default', {}, ($$anchor) => {
			var h1 = root();

			$.append($$anchor, h1);
		});

		$.append($$anchor, fragment_1);
	});

	var node_2 = $.sibling(node, 3);

	$.slot(node_2, $$props, 'default', {}, ($$anchor) => {
		var fragment_2 = $.comment();
		var node_3 = $.first_child(fragment_2);

		$.slot(node_3, $$props, 'default', {}, ($$anchor) => {
			var p = root_1();

			$.append($$anchor, p);
		});

		$.append($$anchor, fragment_2);
	});

	$.append($$anchor, fragment);
}
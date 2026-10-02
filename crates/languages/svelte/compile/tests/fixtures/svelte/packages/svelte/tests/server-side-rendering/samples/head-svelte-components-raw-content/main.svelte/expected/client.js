import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, () => "title", false, ($$element, $$anchor) => {
		var text = $.text('lorem');

		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.element(node_1, () => "style", false, ($$element_1, $$anchor) => {
		var text_1 = $.text();

		text_1.nodeValue = '.ipsum { display: block; }';
		$.append($$anchor, text_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.element(node_2, () => "script", false, ($$element_2, $$anchor) => {
		var text_2 = $.text();

		text_2.nodeValue = 'console.log(true);';
		$.append($$anchor, text_2);
	});

	$.append($$anchor, fragment);
}
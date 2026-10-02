import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>content</p>`);

export default function Main($$anchor, $$props) {
	var p = root();

	$.head('o1e4hf', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.element(node, () => 'style', false, ($$element, $$anchor) => {
			$.attribute_effect($$element, () => ({ type: 'text/css' }));

			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.css));
			$.append($$anchor, text);
		});

		$.append($$anchor, fragment);
	});

	$.append($$anchor, p);
}
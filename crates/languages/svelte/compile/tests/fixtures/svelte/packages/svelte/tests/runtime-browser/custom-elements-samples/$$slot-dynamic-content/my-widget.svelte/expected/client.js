import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>named fallback</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function My_widget($$anchor, $$props) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var text = $.text('fallback');

		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'named', {}, ($$anchor) => {
		var p = root();

		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}

customElements.define('my-widget', $.create_custom_element(My_widget, {}, ['default', 'named'], [], { mode: 'open' }));
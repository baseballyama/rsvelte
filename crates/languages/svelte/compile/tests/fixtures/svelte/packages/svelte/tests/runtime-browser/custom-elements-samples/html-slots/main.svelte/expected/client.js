import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>default fallback content</p>`);
var root_1 = $.from_html(`<p>foo fallback content</p>`);
var root_2 = $.from_html(`<div><!> <!></div>`);

export default function Main($$anchor, $$props) {
	var div = root_2();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var p = root();

		$.append($$anchor, p);
	});

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'foo', {}, ($$anchor) => {
		var p_1 = root_1();

		$.append($$anchor, p_1);
	});

	$.reset(div);
	$.append($$anchor, div);
}

customElements.define('custom-element', $.create_custom_element(Main, {}, ['default', 'foo'], [], { mode: 'open' }));
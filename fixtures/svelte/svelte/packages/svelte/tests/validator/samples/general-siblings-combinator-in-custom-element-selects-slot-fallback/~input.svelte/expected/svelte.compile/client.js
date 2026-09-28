import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-52lxke">Paragraph 2</p>`);
var root_1 = $.from_html(`<h1 class="svelte-52lxke">Heading 1</h1> <span>Span 1</span> <span>Span 2</span> <!>`, 1);

const $$css = {
	hash: 'svelte-52lxke',
	code: '\n	/* This will not be picked up */\n\n	/* This will get picked up */h1.svelte-52lxke ~ p:where(.svelte-52lxke) {color:red;}'
};

export default function Input($$anchor, $$props) {
	$.append_styles($$anchor, $$css);

	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 6);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var p = root();

		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}

customElements.define('my-element', $.create_custom_element(Input, {}, ['default'], [], { mode: 'open' }));
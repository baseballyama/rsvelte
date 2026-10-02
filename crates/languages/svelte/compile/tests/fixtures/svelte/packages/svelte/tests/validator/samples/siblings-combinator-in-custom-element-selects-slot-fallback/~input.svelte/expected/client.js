import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="svelte-13rp9nx">Hello</span>`);
var root_1 = $.from_html(`<h1 class="svelte-13rp9nx">test</h1> <!>`, 1);

const $$css = {
	hash: 'svelte-13rp9nx',
	code: '\n	/* This will not be picked up */\n\n	/* This will be picked up */h1.svelte-13rp9nx + span:where(.svelte-13rp9nx) {color:red;}'
};

export default function Input($$anchor, $$props) {
	$.append_styles($$anchor, $$css);

	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var span = root();

		$.append($$anchor, span);
	});

	$.append($$anchor, fragment);
}

customElements.define('custom-element', $.create_custom_element(Input, {}, ['default'], [], { mode: 'open' }));
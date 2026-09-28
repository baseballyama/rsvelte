import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const my_snippet = ($$anchor) => {
	var span = root();

	$.append($$anchor, span);
};

var root = $.from_html(`<span class="svelte-e63w81">Hello world</span>`);
var root_1 = $.from_html(`<div class="svelte-e63w81"><!></div> <p class="svelte-e63w81"><strong><!></strong></p>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	my_snippet(node);
	$.reset(div);

	var p = $.sibling(div, 2);

	{
		const my_snippet = ($$anchor) => {
			var span_1 = root();

			$.append($$anchor, span_1);
		};

		var strong = $.child(p);
		var node_1 = $.child(strong);

		my_snippet(node_1);
		$.reset(strong);
		$.reset(p);
	}

	$.append($$anchor, fragment);
}
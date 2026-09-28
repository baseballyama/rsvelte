import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<y class="svelte-81qsrz">this should be green</y>`);
var root_1 = $.from_html(`<x class="svelte-81qsrz"></x> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	{
		const foo = ($$anchor) => {
			var y = root();

			$.append($$anchor, y);
		};

		Child(node, { foo, $$slots: { foo: true } });
	}

	$.append($$anchor, fragment);
}
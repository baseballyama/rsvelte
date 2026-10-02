import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

var root = $.from_html(`<input type="checkbox"/> <!>`, 1);

export default function Main($$anchor) {
	let show = $.state(true);
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			Component($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.bind_checked(input, () => $.get(show), ($$value) => $.set(show, $$value));
	$.append($$anchor, fragment);
}
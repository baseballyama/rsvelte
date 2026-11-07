import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get, has, has_unset } from './main.svelte';

var root = $.from_html(`<h2>it's me</h2>`);
var root_1 = $.from_html(`<h2>or not</h2>`);
var root_2 = $.from_html(`<h1> </h1> <!> <!>`, 1);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	const message = get();
	var fragment = root_2();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var node = $.sibling(h1, 2);

	{
		var consequent = ($$anchor) => {
			var h2 = root();

			$.append($$anchor, h2);
		};

		var d = $.derived(() => has());

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var h2_1 = root_1();

			$.append($$anchor, h2_1);
		};

		var d_1 = $.derived(() => !has_unset());

		$.if(node_1, ($$render) => {
			if ($.get(d_1)) $$render(consequent_1);
		});
	}

	$.template_effect(() => $.set_text(text, message));
	$.append($$anchor, fragment);
	$.pop();
}
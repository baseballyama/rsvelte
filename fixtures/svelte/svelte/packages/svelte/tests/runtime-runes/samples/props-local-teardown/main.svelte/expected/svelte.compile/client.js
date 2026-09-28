import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

var root = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Main($$anchor) {
	let toggle = $.state(true);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Component($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($.get(toggle)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(toggle, !$.get(toggle)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
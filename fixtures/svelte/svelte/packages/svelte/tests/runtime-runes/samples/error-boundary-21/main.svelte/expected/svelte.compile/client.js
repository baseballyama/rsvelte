import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<button></button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		const failed = ($$anchor) => {
			var div = root();
			var text = $.only_child(div, true);

			$.template_effect(() => $.set_text(text, $.get(count)));
			$.append($$anchor, div);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			Child($$anchor, {});
		});
	}

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
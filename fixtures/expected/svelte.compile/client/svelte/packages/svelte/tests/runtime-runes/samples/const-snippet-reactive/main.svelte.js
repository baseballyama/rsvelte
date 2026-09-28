import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

const snip = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

var root = $.from_html(`<p>snip</p>`);
var root_1 = $.from_html(`<button></button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			const test = $.derived(() => $.get(count) % 2 === 0 ? undefined : snip);

			Component($$anchor, {
				get test() {
					return $.get(test);
				}
			});
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
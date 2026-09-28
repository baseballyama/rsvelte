import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Main($$anchor) {
	let visible = false;

	function foo() {
		return {
			duration: 100,
			css: (t) => {
				return `scale: ${t}`;
			},

			tick: (t) => {
				console.log(`tick: ${t}`);
			}
		};
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.transition(3, div, () => foo);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.event('click', button, () => visible = !visible);
	$.append($$anchor, fragment);
}
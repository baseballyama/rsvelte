import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Toggle foo</button> <button>Toggle bar</button> <hr/> <!> <hr/> <!>`, 1);

export default function Main($$anchor) {
	let foo = false;
	let bar = [false];
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 4);

	$.html(node, () => `foo: ${foo}, bar: ${bar.every((x) => x)}`);

	var node_1 = $.sibling(node, 4);

	{
		var consequent = ($$anchor) => {
			var text = $.text('foo!');

			$.append($$anchor, text);
		};

		var consequent_1 = ($$anchor) => {
			var text_1 = $.text('bar!');

			$.append($$anchor, text_1);
		};

		var d = $.derived(() => bar.every((x) => x));

		$.if(node_1, ($$render) => {
			if (foo) $$render(consequent); else if ($.get(d)) $$render(consequent_1, 1);
		});
	}

	$.event('click', button, () => foo = !foo);
	$.event('click', button_1, () => bar[0] = !bar[0]);
	$.append($$anchor, fragment);
}
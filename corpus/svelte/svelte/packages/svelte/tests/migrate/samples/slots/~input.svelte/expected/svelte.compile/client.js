import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<button><!></button> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.child(button);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(button);

	var node_1 = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.slot(node_2, $$props, 'foo', { foo: foos }, null);
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (foos) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = root();
			var text = $.first_child(fragment_2);

			text.nodeValue = `${$$slots ?? ''} `;

			var node_4 = $.sibling(text);

			$.slot(node_4, $$props, 'bar', {}, null);
			$.append($$anchor, fragment_2);
		};

		$.if(node_3, ($$render) => {
			if ($$slots.bar) $$render(consequent_1);
		});
	}

	var node_5 = $.sibling(node_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			var text_1 = $.text('foo');

			$.append($$anchor, text_1);
		};

		$.if(node_5, ($$render) => {
			if ($$slots.default) $$render(consequent_2);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_3 = ($$anchor) => {
			var text_2 = $.text('foo');

			$.append($$anchor, text_2);
		};

		$.if(node_6, ($$render) => {
			if ($$slots['default']) $$render(consequent_3);
		});
	}

	var node_7 = $.sibling(node_6, 2);

	$.slot(node_7, $$props, 'default', { header: 'something', title: my_title, id }, null);
	$.append($$anchor, fragment);
}
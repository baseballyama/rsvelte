import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<button><!></button> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);

	// to show that it doesn't bail out from the whole migration
	let count = 0;

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.child(button);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(button);

	var text = $.sibling(button);
	var node_1 = $.sibling(text);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.slot(node_2, $$props, 'foo', { foo }, null);
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (foo) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = root();
			var text_1 = $.first_child(fragment_2);

			text_1.nodeValue = `${$$slots ?? ''} `;

			var node_4 = $.sibling(text_1);

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
			var text_2 = $.text('foo');

			$.append($$anchor, text_2);
		};

		$.if(node_5, ($$render) => {
			if ($$slots.default) $$render(consequent_2);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_3 = ($$anchor) => {
			var text_3 = $.text('foo');

			$.append($$anchor, text_3);
		};

		$.if(node_6, ($$render) => {
			if ($$slots['default']) $$render(consequent_3);
		});
	}

	var node_7 = $.sibling(node_6, 2);

	{
		var consequent_4 = ($$anchor) => {
			var text_4 = $.text('foo');

			$.append($$anchor, text_4);
		};

		$.if(node_7, ($$render) => {
			if ($$slots['dashed-name']) $$render(consequent_4);
		});
	}

	var node_8 = $.sibling(node_7, 2);

	$.slot(node_8, $$props, 'dashed-name', {}, null);
	$.template_effect(() => $.set_text(text, ` ${count ?? ''} `));
	$.event('click', button, () => count++);
	$.append($$anchor, fragment);
}

customElements.define('my-element', $.create_custom_element(Input, {}, ['default', 'foo', 'bar', 'dashed-name'], [], { mode: 'open' }));
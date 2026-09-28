import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

var root = $.from_html(`<button> </button> <button> </button> <!>`, 1);

export default function Main($$anchor) {
	let message = $.state('hello');
	let count = $.state(0);
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1, true);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			Component($$anchor, {
				get count() {
					return $.get(count);
				},

				get message() {
					return $.get(message);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(count) < 2 && $.get(message) === 'hello') $$render(consequent);
		});
	}

	$.template_effect(() => {
		$.set_text(text, $.get(count));
		$.set_text(text_1, $.get(message));
	});

	$.delegated('click', button, () => $.update(count));
	$.delegated('click', button_1, () => $.set(message, $.get(message) === 'hello' ? 'goodbye' : 'hello', true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
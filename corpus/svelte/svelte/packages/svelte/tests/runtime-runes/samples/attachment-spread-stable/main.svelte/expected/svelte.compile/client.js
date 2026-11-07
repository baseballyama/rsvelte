import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<button> </button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Component($$anchor, {
				get 'data-count'() {
					return $.get(count);
				},

				[$.attachment()]: () => {
					console.log('up');

					return () => console.log('down');
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(count) < 2) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
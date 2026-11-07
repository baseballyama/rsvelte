import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from 'svelte';

var root = $.from_html(`<button> </button> <button>toggle</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(false);
	let count = $.state(0);
	let d_count = $.derived(() => $.get(count));
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $.get(d_count)));
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, () => $.set(count, $.get(count) + 1));
	$.delegated('click', button_1, () => fork(() => $.set(show, !$.get(show))).commit());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from 'svelte';

var root = $.from_html(`<!> <button>fork toggle</button> <button>toggle</button> <button>increment count 1</button> <button>increment count 2</button> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let show_count_1 = $.state(true);
	let count_1 = $.state(0);
	let count_2 = $.state(0);
	const count = $.derived(() => $.get(show_count_1) ? $.get(count_1) : $.get(count_2));
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {};

		$.if(node, ($$render) => {
			if ($.get(count)) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var p = $.sibling(button_3, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(count)));

	$.delegated('click', button, () => {
		const f = fork(() => {
			$.set(show_count_1, !$.get(show_count_1));
		});

		f.discard();
	});

	$.delegated('click', button_1, () => $.set(show_count_1, !$.get(show_count_1)));
	$.delegated('click', button_2, () => $.update(count_1));
	$.delegated('click', button_3, () => $.update(count_2));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
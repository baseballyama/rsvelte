import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from "svelte";

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>fork</button> <button>toggle</button> <button> </button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let clicks = $.state(0);
	let show = $.state(false);
	const derived = $.derived(() => $.get(clicks) * 2);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var text = $.only_child(button_2);
	var node = $.sibling(button_2, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $.get(derived)));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(clicks) ?? ''}`));

	$.delegated('click', button, () => {
		fork(() => {
			$.set(clicks, $.get(clicks) + 1);
			$.set(show, true);
		}).discard();
	});

	$.delegated('click', button_1, () => $.set(show, !$.get(show)));
	$.delegated('click', button_2, () => $.update(clicks));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
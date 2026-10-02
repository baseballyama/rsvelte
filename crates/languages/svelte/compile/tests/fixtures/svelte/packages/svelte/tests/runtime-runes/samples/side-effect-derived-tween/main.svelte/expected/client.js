import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tween } from 'svelte/motion';

var root = $.from_html(`<button>external</button> <!> <button>internal</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let outside_basic = $.state(false);
	let outside_basic_tween = new Tween(0);

	const throws_basic = $.derived(() => {
		outside_basic_tween.set(1);

		return outside_basic_tween;
	});

	let inside_basic = $.state(false);

	const works_basic = $.derived(() => {
		let internal = new Tween(0);

		internal.set(1);

		return internal;
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(throws_basic)));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if ($.get(outside_basic)) $$render(consequent);
		});
	}

	var button_1 = $.sibling(node, 2);
	var node_1 = $.sibling(button_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $.get(works_basic)));
			$.append($$anchor, text_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(inside_basic)) $$render(consequent_1);
		});
	}

	$.delegated('click', button, () => $.set(outside_basic, true));
	$.delegated('click', button_1, () => $.set(inside_basic, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
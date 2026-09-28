import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from 'svelte';

var root = $.from_html(`<button><!></button>`);
var root_1 = $.from_html(`<button>fork</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let condition = $.state(false);
	let checked = $.state(false);
	const d = $.derived(() => ({ checked: $.get(checked) }));
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			const foo = ($$anchor, $$arg0) => {
				let checked = () => ($$arg0?.()).checked;

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, checked()));
				$.append($$anchor, text);
			};

			var button_1 = root();
			var node_1 = $.child(button_1);

			foo(node_1, () => $.get(d));
			$.reset(button_1);
			$.delegated('click', button_1, () => $.set(checked, !$.get(checked)));
			$.append($$anchor, button_1);
		};

		$.if(node, ($$render) => {
			if ($.get(condition)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => {
		fork(() => {
			$.set(condition, true);
		}).commit();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
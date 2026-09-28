import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <br/> `, 1);
var root_1 = $.from_html(` <button>Toggle</button> <!>`, 1);

export default function Main($$anchor) {
	let first = $.state(true);
	let second = $.state(false);
	let derivedSecond = $.derived(() => $.get(second));

	queueMicrotask(() => {
		$.set(first, false);
	});

	$.next();

	var fragment = root_1();
	var text = $.first_child(fragment);
	var button = $.sibling(text);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var text_1 = $.first_child(fragment_1);
			var text_2 = $.sibling(text_1, 2);

			$.template_effect(() => {
				$.set_text(text_1, `first: ${$.get(first) ?? ''} `);
				$.set_text(text_2, ` second: ${$.get(derivedSecond) ?? ''}`);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(first) || $.get(derivedSecond)) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, `${$.get(first) ?? ''} ${$.get(second) ?? ''} `));

	$.delegated('click', button, () => {
		$.set(second, true);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);
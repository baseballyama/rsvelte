import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>toggle a</button> <button>toggle b</button> <!>`, 1);

export default function Main($$anchor) {
	let a = $.state(true);
	let b = $.state($.proxy({ c: true }));
	const x = $.derived(() => $.get(b));
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, `${$.get(a) ?? ''}/${$.get(x).c ?? ''}/${$.get(x).c ?? ''}`));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if ($.get(x)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(a, !$.get(a)));
	$.delegated('click', button_1, () => $.set(b, $.get(b) ? null : { c: true }, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
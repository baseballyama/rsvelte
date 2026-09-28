import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<button> </button> <button>clear</button> <button>reverse</button> <!> <strong> </strong>`, 1);

export default function Main($$anchor) {
	const array = $.proxy([1, 2, 3]);
	const sum = $.derived(() => array.reduce((a, b) => a + b, 0));
	var fragment = root_1();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var node = $.sibling(button_2, 2);

	$.each(node, 17, () => array, $.index, ($$anchor, n) => {
		var span = root();
		var text_1 = $.only_child(span, true);

		$.template_effect(() => $.set_text(text_1, $.get(n)));
		$.append($$anchor, span);
	});

	var strong = $.sibling(node, 2);
	var text_2 = $.only_child(strong);

	$.template_effect(
		($0) => {
			$.set_text(text, `${$0 ?? ''} = ${$.get(sum) ?? ''}`);
			$.set_text(text_2, `array[1]: ${array[1] ?? ''}`);
		},
		[() => array.join(' + ')]
	);

	$.delegated('click', button, () => array.push(array.length + 1));
	$.delegated('click', button_1, () => array.length = 1);
	$.delegated('click', button_2, () => array.reverse());
	$.append($$anchor, fragment);
}

$.delegate(['click']);
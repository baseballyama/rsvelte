import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);
var root_1 = $.from_html(`<p> </p> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let power = $.state(0);

	$.user_effect(() => {
		if ($.get(power) !== 10) {
			$.set(power, $.get(power) + 1);
		}
	});

	var fragment = root_1();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var node = $.sibling(p, 2);

	$.each(node, 16, () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], $.index, ($$anchor, n) => {
		var button = root();
		var text_1 = $.only_child(button, true);

		$.template_effect(() => $.set_text(text_1, n));
		$.event('click', button, () => $.set(power, n, true));
		$.append($$anchor, button);
	});

	$.template_effect(() => $.set_text(text, `power: ${$.get(power) ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}
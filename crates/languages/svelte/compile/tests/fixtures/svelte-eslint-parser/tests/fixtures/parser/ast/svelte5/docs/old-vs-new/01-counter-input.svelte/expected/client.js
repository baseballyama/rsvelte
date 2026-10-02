import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function _1_counter_input($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let double = $.derived(() => $.get(count) * 2);

	$.user_effect(() => {
		if ($.get(count) > 10) {
			alert('Too high!');
		}
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `${$.get(count) ?? ''} / ${$.get(double) ?? ''}`));
	$.event('click', button, () => $.update(count));
	$.append($$anchor, button);
	$.pop();
}
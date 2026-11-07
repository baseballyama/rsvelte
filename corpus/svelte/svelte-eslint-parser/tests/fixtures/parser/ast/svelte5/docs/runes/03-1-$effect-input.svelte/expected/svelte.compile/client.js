import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <p> </p>`, 1);

export default function _3_1_$effect_input($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let double = $.derived(() => $.get(count) * 2);

	$.user_effect(() => {
		// runs when the component is mounted, and again
		// whenever `count` or `double` change,
		// after the DOM has been updated
		console.log({ count: $.get(count), double: $.get(double) });

		return () => {
			// if a callback is provided, it will run
			// a) immediately before the effect re-runs
			// b) when the component is destroyed
			console.log('cleanup');
		};
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var p = $.sibling(button, 2);
	var text_1 = $.only_child(p);

	$.template_effect(() => {
		$.set_text(text, $.get(double));
		$.set_text(text_1, `${$.get(count) ?? ''} doubled is ${$.get(double) ?? ''}`);
	});

	$.event('click', button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}
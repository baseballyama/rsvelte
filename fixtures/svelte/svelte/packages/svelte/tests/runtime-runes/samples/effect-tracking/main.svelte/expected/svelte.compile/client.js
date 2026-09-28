import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';

var root = $.from_html(`<p> </p> <p> </p> <p> </p> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const foo = $.effect_tracking();
	let bar = $.state(false);

	$.user_pre_effect(() => {
		$.set(bar, $.effect_tracking(), true);
	});

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2, true);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, foo);
			$.set_text(text_1, $.get(bar));
			$.set_text(text_2, $0);
			$.set_text(text_3, $1);
		},
		[
			() => ($.get(bar), $.effect_tracking()),
			() => untrack(() => ($.get(bar), $.effect_tracking()))
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}
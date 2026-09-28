import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p> <p></p> <p></p> <p></p> <p></p> <p></p> <p></p>`, 1);

export default function Input($$anchor) {
	let condition = Math.random() < 0.5;
	var fragment = root();
	var p = $.first_child(fragment);

	$.set_class(p, 1, $.clsx(['used1']), 'svelte-18a10p');

	var p_1 = $.sibling(p, 2);

	$.set_class(p_1, 1, $.clsx([{ used2: true }]), 'svelte-18a10p');

	var p_2 = $.sibling(p_1, 2);

	$.set_class(p_2, 1, $.clsx({ used3: true }), 'svelte-18a10p');

	var p_3 = $.sibling(p_2, 2);

	$.set_class(p_3, 1, $.clsx({ 'used4 used5': true }), 'svelte-18a10p');

	var p_4 = $.sibling(p_3, 2);

	$.set_class(p_4, 1, $.clsx({ used6 }), 'svelte-18a10p');

	var p_5 = $.sibling(p_4, 2);
	var p_6 = $.sibling(p_5, 2);

	$.template_effect(() => {
		$.set_class(p_5, 1, $.clsx([condition ? 'used7' : 'used8']), 'svelte-18a10p');
		$.set_class(p_6, 1, $.clsx([condition && 'used9']), 'svelte-18a10p');
	});

	$.append($$anchor, fragment);
}
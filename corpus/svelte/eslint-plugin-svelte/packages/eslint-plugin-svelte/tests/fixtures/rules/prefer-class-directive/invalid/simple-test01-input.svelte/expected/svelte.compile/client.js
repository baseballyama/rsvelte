import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button> <button>bar</button> <button>baz</button>`, 1);

export default function Simple_test01_input($$anchor) {
	let current = 'foo';
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.template_effect(() => {
		$.set_class(button, 1, $.clsx(current === 'foo' ? 'selected' : ''), 'svelte-hk31ny');
		$.set_class(button_1, 1, $.clsx(current === 'bar' ? 'selected' : ''), 'svelte-hk31ny');
		$.set_class(button_2, 1, $.clsx(current === 'baz' ? 'selected' : ''), 'svelte-hk31ny');
	});

	$.event('click', button, () => current = 'foo');
	$.event('click', button_1, () => current = 'bar');
	$.event('click', button_2, () => current = 'baz');
	$.append($$anchor, fragment);
}
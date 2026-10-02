import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button> <button>bar</button> <button>baz</button>`, 1);

export default function Simple_test01_output($$anchor) {
	let current = 'foo';
	var fragment = root();
	var button = $.first_child(fragment);
	let classes;
	var button_1 = $.sibling(button, 2);
	let classes_1;
	var button_2 = $.sibling(button_1, 2);
	let classes_2;

	$.template_effect(() => {
		classes = $.set_class(button, 1, 'svelte-tz2q6v', null, classes, { selected: current === 'foo' });
		classes_1 = $.set_class(button_1, 1, 'svelte-tz2q6v', null, classes_1, { selected: current === 'bar' });
		classes_2 = $.set_class(button_2, 1, 'svelte-tz2q6v', null, classes_2, { selected: current === 'baz' });
	});

	$.event('click', button, () => current = 'foo');
	$.event('click', button_1, () => current = 'bar');
	$.event('click', button_2, () => current = 'baz');
	$.append($$anchor, fragment);
}
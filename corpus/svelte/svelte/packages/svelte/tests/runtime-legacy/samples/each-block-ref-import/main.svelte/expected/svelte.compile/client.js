import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { foo } from './utils';

var root = $.from_html(`<input type="text"/>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => foo.bar, $.index, ($$anchor, bar, $$index) => {
		var input = root();

		$.remove_input_defaults(input);
		$.bind_value(input, () => $.get(bar).value, ($$value) => ($.get(bar).value = $$value));
		$.append($$anchor, input);
	});

	$.append($$anchor, fragment);
	$.pop();
}
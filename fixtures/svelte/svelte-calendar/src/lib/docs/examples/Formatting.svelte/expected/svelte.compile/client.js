import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Datepicker } from '../../index';

var root = $.from_html(`<!> <input type="text" class="svelte-vh5avo"/> <p>See <a href="https://day.js.org/docs/en/display/format">dayjs</a> documentation for formatting docs</p>`, 1);

export default function Formatting($$anchor) {
	let format = 'dddd, MMMM D, YYYY';
	var fragment = root();
	var node = $.first_child(fragment);

	Datepicker(node, {
		get format() {
			return format;
		}
	});

	var input = $.sibling(node, 2);

	$.remove_input_defaults(input);
	$.next(2);
	$.bind_value(input, () => format, ($$value) => format = $$value);
	$.append($$anchor, fragment);
}
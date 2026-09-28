import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);
var root_1 = $.from_html(`<!> <div> </div>`, 1);

export default function Main($$anchor) {
	let values = $.proxy(['foo', 'bar', 'baz']);
	let elements = $.proxy([]);
	let nums = $.proxy([1, 2, 3]);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 17, () => values, $.index, ($$anchor, value, i) => {
		var input = root();

		$.remove_input_defaults(input);
		$.bind_this(input, ($$value, i) => elements[i] = $$value, (i) => elements?.[i], () => [i]);
		$.bind_value(input, () => values[i], ($$value) => values[i] = $$value);
		$.append($$anchor, input);
	});

	var div = $.sibling(node, 2);
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, elements.length));
	$.append($$anchor, fragment);
}
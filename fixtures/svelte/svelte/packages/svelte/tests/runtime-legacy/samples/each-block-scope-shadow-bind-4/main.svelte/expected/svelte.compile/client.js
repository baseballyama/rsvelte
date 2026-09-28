import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> <input/></div>`);
var root_1 = $.from_html(`<!> <button>Button</button>`, 1);

export default function Main($$anchor) {
	let a = [{ a: { b: 'Hello', c: 'World' }, key: 'b' }];
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 17, () => a, $.index, ($$anchor, $$item, $$index, $$array) => {
		let a = () => $.get($$item).a;
		let key = () => $.get($$item).key;
		var div = root();
		var text = $.child(div);
		var input = $.sibling(text);

		$.remove_input_defaults(input);
		$.reset(div);
		$.template_effect(() => $.set_text(text, `${key() ?? ''}: ${a()[key()] ?? ''} `));
		$.bind_value(input, () => a()[key()], ($$value) => (a()[key()] = $$value));
		$.append($$anchor, div);
	});

	var button = $.sibling(node, 2);

	$.event('click', button, () => a[0].key = 'c');
	$.append($$anchor, fragment);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <div></div> <div></div> <input type="number"/> <input type="number"/>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = 1;
	let double = $.derived(() => count * 2);
	let element = null;
	let element_with_state = $.state(null);
	let with_state = $.proxy({ foo: 1 });
	let without_state = { foo: 2 };

	$.user_effect(() => {
		$$props.log(element.tagName, $.get(element_with_state).tagName);
	});

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = `1 ${$.get(double) ?? ''} `;

	var div = $.sibling(text);

	$.bind_this(div, ($$value) => element = $$value, () => element);

	var div_1 = $.sibling(div, 2);

	$.bind_this(div_1, ($$value) => $.set(element_with_state, $$value), () => $.get(element_with_state));

	var input = $.sibling(div_1, 2);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);
	$.bind_value(input, () => with_state.foo, ($$value) => with_state.foo = $$value);
	$.bind_value(input_1, () => without_state.foo, ($$value) => without_state.foo = $$value);
	$.append($$anchor, fragment);
	$.pop();
}
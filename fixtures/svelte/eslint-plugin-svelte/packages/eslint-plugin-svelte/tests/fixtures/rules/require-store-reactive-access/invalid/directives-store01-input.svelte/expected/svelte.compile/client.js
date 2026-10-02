import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<button></button> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <!> <div></div> <div></div> <div></div> <div></div>`, 1);

export default function Directives_store01_input($$anchor, $$props) {
	$.push($$props, true);

	let store = writable('hello');
	const constStore = writable('hello');
	let color = writable('red');
	let value = writable('hello');
	let handleClick = writable(() => {});
	const list = [];
	var fragment = root_1();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);
	let styles;
	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { color });

	var div_2 = $.sibling(div_1, 2);

	$.action(div_2, ($$node) => store?.($$node));

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);
	var node = $.sibling(div_5, 2);

	$.each(node, 24, () => list, (e) => e, ($$anchor, e) => {
		var div_6 = root();

		$.animation(div_6, () => store, null);
		$.append($$anchor, div_6);
	});

	var div_7 = $.sibling(node, 2);
	let classes;
	var div_8 = $.sibling(div_7, 2);
	let classes_1;
	var div_9 = $.sibling(div_8, 2);
	let classes_2;
	var div_10 = $.sibling(div_9, 2);
	let classes_3;

	$.template_effect(() => {
		styles = $.set_style(div, '', styles, { color: store });
		classes = $.set_class(div_7, 1, '', null, classes, { name: constStore });
		classes_1 = $.set_class(div_8, 1, '', null, classes_1, { constStore });
		classes_2 = $.set_class(div_9, 1, '', null, classes_2, { name: store });
		classes_3 = $.set_class(div_10, 1, '', null, classes_3, { store });
	});

	$.event('click', button, handleClick);
	$.transition(3, div_3, () => store);
	$.transition(1, div_4, () => store);
	$.transition(2, div_5, () => store);
	$.append($$anchor, fragment);
	$.pop();
}
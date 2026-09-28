import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <button>Show Promise A</button> <button>Show Promise B</button> <button>Show Promise C</button> <button>Show Promise D</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const promise_a = Promise.resolve('a');
	const promise_b = Promise.resolve('b');
	const promise_c = Promise.resolve('c');
	const promise_d = new Promise(() => {});
	let current_promise = $.state($.proxy(promise_a));
	var fragment = root();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => $.get(current_promise),
		($$anchor) => {
			var text_2 = $.text();

			text_2.nodeValue = console.log('pending');
			$.append($$anchor, text_2);
		},
		($$anchor, value) => {
			var text = $.text();

			$.template_effect(($0) => $.set_text(text, $0), [() => console.log($.get(value))]);
			$.append($$anchor, text);
		},
		($$anchor) => {
			var text_1 = $.text();

			text_1.nodeValue = console.log('error');
			$.append($$anchor, text_1);
		}
	);

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.delegated('click', button, () => {
		$.set(current_promise, promise_a, true);
	});

	$.delegated('click', button_1, () => {
		$.set(current_promise, promise_b, true);
	});

	$.delegated('click', button_2, () => {
		$.set(current_promise, promise_c, true);
	});

	$.delegated('click', button_3, () => {
		$.set(current_promise, promise_d, true);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
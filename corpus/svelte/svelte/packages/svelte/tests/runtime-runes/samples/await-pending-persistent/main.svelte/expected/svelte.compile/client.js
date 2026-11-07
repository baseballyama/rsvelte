import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <p> </p>`, 1);
var root_1 = $.from_html(` <p>pending</p>`, 1);
var root_2 = $.from_html(`<!> <button>Show Promise A</button> <button>Show Promise B</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const a = new Promise(() => {});
	const b = new Promise(() => {});
	let promise = $.state($.proxy(a));
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => $.get(promise),
		($$anchor) => {
			var fragment_2 = root_1();
			var text_2 = $.first_child(fragment_2);

			text_2.nodeValue = `${console.log('rendering pending block') ?? ''} `;
			$.next();
			$.append($$anchor, fragment_2);
		},
		($$anchor, value) => {
			var fragment_1 = root();
			var text = $.first_child(fragment_1);

			text.nodeValue = `${console.log('rendering then block') ?? ''} `;

			var p = $.sibling(text);
			var text_1 = $.only_child(p);

			$.template_effect(() => $.set_text(text_1, `then ${$.get(value) ?? ''}`));
			$.append($$anchor, fragment_1);
		}
	);

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => $.set(promise, a, true));
	$.delegated('click', button_1, () => $.set(promise, b, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
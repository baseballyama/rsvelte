import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Resolve (immediate)</button> <button>Resolve (timeout)</button> <button>Reject (immediate)</button> <button>Reject (timeout)</button> <p><!></p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let p = $.state(null);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var p_1 = $.sibling(button_3, 2);
	var node = $.child(p_1);

	$.await(
		node,
		() => $.get(p),
		($$anchor) => {
			var text_2 = $.text('...');

			$.append($$anchor, text_2);
		},
		($$anchor, v) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, `resolved [${$.get(v) ?? ''}]`));
			$.append($$anchor, text);
		},
		($$anchor, err) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, `err [${$.get(err) ?? ''}]`));
			$.append($$anchor, text_1);
		}
	);

	$.reset(p_1);

	$.delegated('click', button, () => {
		$.set(
			p,
			new Promise((resolve, reject) => {
				resolve("?");
			}),
			true
		);
	});

	$.delegated('click', button_1, () => {
		$.set(
			p,
			new Promise((resolve, reject) => {
				setTimeout(() => resolve("OK"), 1);
			}),
			true
		);
	});

	$.delegated('click', button_2, () => {
		$.set(
			p,
			new Promise((resolve, reject) => {
				reject("??");
			}),
			true
		);
	});

	$.delegated('click', button_3, () => {
		$.set(
			p,
			new Promise((resolve, reject) => {
				setTimeout(() => reject("Yeah"), 1);
			}),
			true
		);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
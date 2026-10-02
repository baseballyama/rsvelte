import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p style="color: red"> </p>`);
var root_2 = $.from_html(`<p>...waiting</p>`);
var root_3 = $.from_html(`<button>generate random number</button> <!> <!> <!> <!>`, 1);

export default function Await_blocks_input($$anchor, $$props) {
	$.push($$props, true);

	async function getRandomNumber() {
		const res = await fetch(`tutorial/random-number`);
		const text = await res.text();

		if (res.ok) {
			return text;
		} else {
			throw new Error(text);
		}
	}

	let promise = getRandomNumber();

	function handleClick() {
		promise = getRandomNumber();
	}

	var fragment = root_3();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.await(
		node,
		() => promise,
		($$anchor) => {
			var p_2 = root_2();

			$.append($$anchor, p_2);
		},
		($$anchor, number) => {
			var p = root();
			var text_1 = $.only_child(p);

			$.template_effect(() => $.set_text(text_1, `The number is ${$.get(number) ?? ''}`));
			$.append($$anchor, p);
		},
		($$anchor, error) => {
			var p_1 = root_1();
			var text_2 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_2, $.get(error).message));
			$.append($$anchor, p_1);
		}
	);

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => promise, null, ($$anchor, value) => {
		var p_3 = root();
		var text_3 = $.only_child(p_3);

		$.template_effect(() => $.set_text(text_3, `the value is ${$.get(value) ?? ''}`));
		$.append($$anchor, p_3);
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(node_2, () => promise, null, void 0, ($$anchor, error) => {
		var p_4 = root_1();
		var text_4 = $.only_child(p_4, true);

		$.template_effect(() => $.set_text(text_4, $.get(error).message));
		$.append($$anchor, p_4);
	});

	var node_3 = $.sibling(node_2, 2);

	$.await(
		node_3,
		() => promise,
		null,
		($$anchor, value) => {
			var p_5 = root();
			var text_5 = $.only_child(p_5);

			$.template_effect(() => $.set_text(text_5, `the value is ${$.get(value) ?? ''}`));
			$.append($$anchor, p_5);
		},
		($$anchor, error) => {
			var p_6 = root_1();
			var text_6 = $.only_child(p_6, true);

			$.template_effect(() => $.set_text(text_6, $.get(error).message));
			$.append($$anchor, p_6);
		}
	);

	$.event('click', button, handleClick);
	$.append($$anchor, fragment);
	$.pop();
}
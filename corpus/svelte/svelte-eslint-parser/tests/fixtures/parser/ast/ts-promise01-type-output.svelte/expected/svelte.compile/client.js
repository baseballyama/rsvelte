import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p style="color: red"> </p>`);
var root_2 = $.from_html(`<p>...waiting</p>`);

export default function Ts_promise01_type_output($$anchor, $$props) {
	$.push($$props, true);

	let promise = new Promise((resolve) => resolve({ a: 42 })); // promise: Promise<{ a: number; }>, Promise: PromiseConstructor, resolve: (value: { a: number; } | PromiseLike<{ a: number; }>) => void, resolve({a:42}): void
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => promise,
		($$anchor) => {
			var p_2 = root_2();

			$.append($$anchor, p_2);
		},
		($$anchor, number) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `The number is ${$.get(number).a ?? ''}`));
			$.append($$anchor, p);
		},
		($$anchor, error) => {
			var p_1 = root_1();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(error).message));
			$.append($$anchor, p_1);
		}
	);

	$.append($$anchor, fragment);
	$.pop();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { sleep } from './sleep.js';

var root = $.from_html(`<p> </p> <p> </p>`, 1);
var root_1 = $.from_html(`<p>loading...</p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = 0;

	const get_promise = () => {
		return sleep(10).then(() => {
			count += 1;

			return 42;
		});
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		get_promise,
		($$anchor) => {
			var p_2 = root_1();

			$.append($$anchor, p_2);
		},
		($$anchor, value) => {
			var fragment_1 = root();
			var p = $.first_child(fragment_1);
			var text = $.only_child(p);
			var p_1 = $.sibling(p, 2);
			var text_1 = $.only_child(p_1);

			$.template_effect(() => {
				$.set_text(text, `the answer is ${$.get(value) ?? ''}`);
				$.set_text(text_1, `count: ${count ?? ''}`);
			});

			$.append($$anchor, fragment_1);
		}
	);

	$.append($$anchor, fragment);
	$.pop();
}
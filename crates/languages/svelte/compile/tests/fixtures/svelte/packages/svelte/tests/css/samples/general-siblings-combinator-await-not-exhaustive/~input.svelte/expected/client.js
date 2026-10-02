import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="b svelte-1x9swqa"></div>`);
var root_1 = $.from_html(`<div class="c svelte-1x9swqa"></div>`);
var root_2 = $.from_html(`<div class="e svelte-1x9swqa"></div>`);
var root_3 = $.from_html(`<div class="d svelte-1x9swqa"></div>`);
var root_4 = $.from_html(`<div class="g svelte-1x9swqa"></div>`);
var root_5 = $.from_html(`<div class="f svelte-1x9swqa"></div>`);
var root_6 = $.from_html(`<div class="a svelte-1x9swqa"></div> <!> <!> <!> <div class="h svelte-1x9swqa"></div>`, 1);

export default function Input($$anchor) {
	let promise = Promise.resolve();
	var fragment = root_6();
	var node = $.sibling($.first_child(fragment), 2);

	$.await(
		node,
		() => promise,
		null,
		($$anchor, value) => {
			var div = root();

			$.append($$anchor, div);
		},
		($$anchor, error) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		}
	);

	var node_1 = $.sibling(node, 2);

	$.await(
		node_1,
		() => promise,
		($$anchor) => {
			var div_3 = root_3();

			$.append($$anchor, div_3);
		},
		void 0,
		($$anchor, error) => {
			var div_2 = root_2();

			$.append($$anchor, div_2);
		}
	);

	var node_2 = $.sibling(node_1, 2);

	$.await(
		node_2,
		() => promise,
		($$anchor) => {
			var div_5 = root_5();

			$.append($$anchor, div_5);
		},
		($$anchor, error) => {
			var div_4 = root_4();

			$.append($$anchor, div_4);
		}
	);

	$.next(2);
	$.append($$anchor, fragment);
}
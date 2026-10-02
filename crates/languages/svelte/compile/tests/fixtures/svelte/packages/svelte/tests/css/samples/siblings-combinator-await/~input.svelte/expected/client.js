import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="c svelte-saribc"></div>`);
var root_1 = $.from_html(`<div class="d svelte-saribc"></div>`);
var root_2 = $.from_html(`<div class="b svelte-saribc"></div>`);
var root_3 = $.from_html(`<div class="a svelte-saribc"></div> <!> <div class="e svelte-saribc"></div>`, 1);

export default function Input($$anchor) {
	let promise = Promise.resolve();
	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 2);

	$.await(
		node,
		() => promise,
		($$anchor) => {
			var div_2 = root_2();

			$.append($$anchor, div_2);
		},
		($$anchor, value) => {
			var div = root();

			$.append($$anchor, div);
		},
		($$anchor, error) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		}
	);

	$.next(2);
	$.append($$anchor, fragment);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="b svelte-ikjwnt"></div>`);
var root_1 = $.from_html(`<div class="c svelte-ikjwnt"></div>`);
var root_2 = $.from_html(`<div class="a svelte-ikjwnt"></div> <!> <div class="d svelte-ikjwnt"></div>`, 1);

export default function Input($$anchor) {
	let array = [];
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 2);

	$.each(
		node,
		17,
		() => array,
		$.index,
		($$anchor, item) => {
			var div = root();

			$.append($$anchor, div);
		},
		($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		}
	);

	$.next(2);
	$.append($$anchor, fragment);
}
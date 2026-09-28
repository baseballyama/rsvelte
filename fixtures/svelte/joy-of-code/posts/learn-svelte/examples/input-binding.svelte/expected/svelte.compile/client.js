import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<p>No results</p>`);
var root_2 = $.from_html(`<div class="container svelte-1tjsi4d"><input type="search" placeholder="Search" class="svelte-1tjsi4d"/> <ul class="svelte-1tjsi4d"></ul></div>`);

export default function Input_binding($$anchor, $$props) {
	$.push($$props, true);

	let list = $.proxy(['Angular', 'React', 'Solid', 'Svelte', 'Vue', 'Qwik']);
	let filteredList = $.derived(() => list.filter((item) => item.toLowerCase().includes($.get(search).toLowerCase())));
	let search = $.state('');
	var div = root_2();
	var input = $.child(div);

	$.remove_input_defaults(input);

	var ul = $.sibling(input, 2);

	$.each(
		ul,
		21,
		() => $.get(filteredList),
		$.index,
		($$anchor, item) => {
			var li = root();
			var text = $.only_child(li, true);

			$.template_effect(() => $.set_text(text, $.get(item)));
			$.append($$anchor, li);
		},
		($$anchor) => {
			var p = root_1();

			$.append($$anchor, p);
		}
	);

	$.reset(ul);
	$.reset(div);
	$.template_effect(() => $.set_value(input, $.get(search)));
	$.delegated('input', input, (e) => $.set(search, e.target.value, true));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input']);
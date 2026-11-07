import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var select_content = $.from_html(`<button class="svelte-1oyxx9b"><selectedcontent class="svelte-1oyxx9b"></selectedcontent></button><option class="svelte-1oyxx9b">A</option><option class="svelte-1oyxx9b">B</option><option class="svelte-1oyxx9b">C</option>`, 1);
var root = $.from_html(`<input class="svelte-1oyxx9b"/> <select class="svelte-1oyxx9b"><!></select>`, 1);

export default function Main($$anchor) {
	let value = $.state('A');
	var fragment = root();
	var input = $.first_child(fragment);
	var select = $.sibling(input, 2);

	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment_1 = select_content();
		var button = $.first_child(fragment_1);
		var selectedcontent = $.child(button);

		$.selectedcontent(selectedcontent, ($$element) => selectedcontent = $$element);
		$.reset(button);
		$.next(3);
		$.append(anchor, fragment_1);
	});

	$.init_select(select);
	$.delegated('input', input, () => {});
	$.bind_select_value(select, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, fragment);
}

$.delegate(['input']);
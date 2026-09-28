import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<button>Update</button> <ul></ul>`, 1);

export default function Main($$anchor) {
	let items = [{ id: 1, value: "test" }];

	const update = () => {
		const clone = items.slice();

		clone[0].value += " !!!";
		items = clone;
	};

	var fragment = root_1();
	var button = $.first_child(fragment);
	var ul = $.sibling(button, 2);

	$.each(ul, 21, () => items, (item) => item.id, ($$anchor, item) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, $.get(item).value));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.event('click', button, update);
	$.append($$anchor, fragment);
}
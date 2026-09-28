import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>remove</button>`);

export default function Main($$anchor) {
	let list = ["a", "b", "c"];

	const remove = (index) => {
		list.splice(index, 1);
		list = list;
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 18, () => list, (value) => value, ($$anchor, value, index) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				var button = root();

				$.event('click', button, (e) => remove($.get(index)));
				$.append($$anchor, button);
			};

			$.if(node_1, ($$render) => {
				if (value) $$render(consequent);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}
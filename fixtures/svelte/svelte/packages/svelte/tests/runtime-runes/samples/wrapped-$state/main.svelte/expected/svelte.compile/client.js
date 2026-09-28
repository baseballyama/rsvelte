import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>Remove entry</button>`);
var root_2 = $.from_html(`<button>Add entry</button> <!> <!>`, 1);

export default function Main($$anchor) {
	function createArray(initial) {
		let array = $.state($.proxy(initial));

		return {
			get value() {
				return $.get(array);
			},

			push(entry) {
				$.get(array).push(entry);
				$.set(array, $.get(array).slice(), true);
			},

			pop() {
				$.get(array).pop();
				$.set(array, $.get(array).slice(), true);
			}
		};
	}

	const array = createArray(['x']);
	var fragment = root_2();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => array.value, $.index, ($$anchor, entry) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(entry)));
		$.append($$anchor, p);
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var button_1 = root_1();

			$.event('click', button_1, () => array.pop());
			$.append($$anchor, button_1);
		};

		$.if(node_1, ($$render) => {
			if (array.value.length > 1) $$render(consequent);
		});
	}

	$.event('click', button, () => array.push('y'));
	$.append($$anchor, fragment);
}
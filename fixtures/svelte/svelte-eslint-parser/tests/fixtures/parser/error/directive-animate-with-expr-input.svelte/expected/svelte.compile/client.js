import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flip } from 'svelte/animate';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<button>Shuffle</button> <!>`, 1);

export default function Directive_animate_with_expr_input($$anchor) {
	const foo = { flip };
	let list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	function shuffle() {
		let currentIndex = list.length;

		while (currentIndex != 0) {
			const randomIndex = Math.floor(Math.random() * currentIndex);

			currentIndex--;
			[list[currentIndex], list[randomIndex]] = [list[randomIndex], list[currentIndex]];
		}
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 26, () => list, (item) => item, ($$anchor, item) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, item));
		$.animation(li, () => foo.flip, null);
		$.append($$anchor, li);
	});

	$.event('click', button, shuffle);
	$.append($$anchor, fragment);
}
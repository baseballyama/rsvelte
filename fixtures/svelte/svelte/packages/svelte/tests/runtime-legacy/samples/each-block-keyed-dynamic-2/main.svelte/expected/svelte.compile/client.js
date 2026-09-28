import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<button>Click Me</button> <ul></ul>`, 1);

export default function Main($$anchor) {
	let num = 0;
	let cards = [];

	function click() {
		// updating cards via push should have no effect to the ul,
		// since its being mutated instead of reassigned
		cards.push(num++);
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var text = $.sibling(button);
	var ul = $.sibling(text);

	$.each(ul, 21, () => cards, $.index, ($$anchor, c) => {
		var li = root();
		var text_1 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_1, $.get(c)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.template_effect(() => $.set_text(text, ` ${num ?? ''} `));
	$.event('click', button, click);
	$.append($$anchor, fragment);
}
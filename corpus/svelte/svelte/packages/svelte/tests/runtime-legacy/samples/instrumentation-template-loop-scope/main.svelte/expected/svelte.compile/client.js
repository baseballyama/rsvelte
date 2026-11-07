import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let x = 0;
	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `x: ${x ?? ''}`));

	$.event('click', button, () => {
		(() => {
			for (let x = 0; x < 10; x++) {}

			x = 42;
		})();
	});

	$.append($$anchor, fragment);
	$.pop();
}
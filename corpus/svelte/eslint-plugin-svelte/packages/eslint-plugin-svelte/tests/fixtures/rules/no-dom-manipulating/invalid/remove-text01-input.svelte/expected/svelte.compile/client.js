import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div> <button>Click Me (Good)</button> <button>Click Me (Bad)</button>`, 1);

export default function Remove_text01_input($$anchor) {
	let div;
	let show;

	// ✓ GOOD
	const toggle = () => show = !show;

	// ✗ BAD
	const update = () => div.textContent = 'foo';

	var fragment = root();
	var div_1 = $.first_child(fragment);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var text = $.text('div');

			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (show) $$render(consequent);
		});
	}

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => div = $$value, () => div);

	var button = $.sibling(div_1, 2);
	var button_1 = $.sibling(button, 2);

	$.event('click', button, () => toggle());
	$.event('click', button_1, () => update());
	$.append($$anchor, fragment);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>div</div>`);
var root_1 = $.from_html(`<!> <button>Click Me (Good)</button> <button>Click Me (Bad)</button>`, 1);

export default function Remove01_input($$anchor) {
	let div;
	let show;

	// ✓ GOOD
	const toggle = () => show = !show;

	// ✗ BAD
	const remove = () => div.remove();

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.bind_this(div_1, ($$value) => div = $$value, () => div);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (show) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);

	$.event('click', button, () => toggle());
	$.event('click', button_1, () => remove());
	$.append($$anchor, fragment);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Thank you. We will bombard your inbox and sell your personal details.</p>`);
var root_1 = $.from_html(`<p>You must opt in to continue. If you're not paying, you're the product.</p>`);
var root_2 = $.from_html(`<label><input type="checkbox"/> Yes! Send me regular email spam</label> <!> <button>Subscribe</button>`, 1);

export default function Checkbox_inputs_input($$anchor) {
	let yes = false;
	var fragment = root_2();
	var label = $.first_child(fragment);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var node = $.sibling(label, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if (yes) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var button = $.sibling(node, 2);

	$.template_effect(() => button.disabled = !yes);
	$.bind_checked(input, () => yes, ($$value) => yes = $$value);
	$.append($$anchor, fragment);
}
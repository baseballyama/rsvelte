import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p id="squared"> </p>`);
var root_1 = $.from_html(`<button>increment</button> <p> </p> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(1);
	let squared = $.derived(() => $.get(count) * $.get(count));

	$.user_effect(() => {
		console.log(`count: ${$.get(count)}`);

		return () => {
			console.log(`squared: ${$.get(squared)}`);
		};
	});

	var fragment = root_1();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p);
	var node = $.sibling(p, 2);

	{
		var consequent = ($$anchor) => {
			var p_1 = root();
			var text_1 = $.only_child(p_1);

			$.template_effect(() => $.set_text(text_1, `squared: ${$.get(squared) ?? ''}`));
			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if ($.get(count) % 2 === 0) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, `count: ${$.get(count) ?? ''}`));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';

var root = $.from_html(`<button> </button>`);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<!> <hr/> <!> <hr/> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let selected = $.state(-1);
	let current = $.state(void 0);
	let div; // explicitly no $state
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.each(node, 16, () => [1, 2, 3], $.index, ($$anchor, n, i) => {
		var button = root();
		var text = $.only_child(button, true);

		$.template_effect(() => $.set_text(text, n));

		$.delegated('click', button, async () => {
			$.set(selected, i, true);
			await tick();
			$.set(current, div?.textContent, true);
		});

		$.append($$anchor, button);
	});

	var node_1 = $.sibling(node, 4);

	$.each(node_1, 16, () => [1, 2, 3], $.index, ($$anchor, n, i) => {
		var fragment_1 = $.comment();
		var node_2 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				var div_1 = root_1();
				var text_1 = $.only_child(div_1, true);

				$.bind_this(div_1, ($$value) => div = $$value, () => div);
				$.template_effect(() => $.set_text(text_1, n));
				$.append($$anchor, div_1);
			};

			$.if(node_2, ($$render) => {
				if ($.get(selected) === i) $$render(consequent);
			});
		}

		$.append($$anchor, fragment_1);
	});

	var p = $.sibling(node_1, 4);
	var text_2 = $.only_child(p, true);

	$.template_effect(() => $.set_text(text_2, $.get(current) ?? '...'));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flushSync } from 'svelte';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<button>switch</button> <main><div> </div> <!></main>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let flag = $.state(true);
	let test = $.state(true);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var main = $.sibling(button, 2);
	var div = $.child(main);
	var text = $.only_child(div, true);
	var node = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var text_1 = $.only_child(div_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(test)));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!$.get(flag)) $$render(consequent);
		});
	}

	$.reset(main);
	$.template_effect(() => $.set_text(text, $.get(flag)));

	$.delegated('click', button, () => {
		flushSync(() => {
			$.set(test, !$.get(test));
		});

		$.set(flag, !$.get(flag));
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
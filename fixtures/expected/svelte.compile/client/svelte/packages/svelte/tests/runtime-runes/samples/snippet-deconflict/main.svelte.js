import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p style="color: red"> </p>`);
var root_1 = $.from_html(`<p style="color: blue"> </p>`);
var root_2 = $.from_html(`<button>push</button> <div style="display: grid; grid-template-columns: 1fr 1fr"><div></div> <div></div></div>`, 1);

export default function Main($$anchor) {
	let numbers = $.proxy([1, 2, 3]);
	var fragment = root_2();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);
	var div_1 = $.child(div);

	{
		const x = ($$anchor, n = $.noop) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, n()));
			$.append($$anchor, p);
		};

		$.each(div_1, 21, () => numbers, $.index, ($$anchor, n) => {
			x($$anchor, () => $.get(n));
		});

		$.reset(div_1);
	}

	var div_2 = $.sibling(div_1, 2);

	{
		const x = ($$anchor, n = $.noop) => {
			var p_1 = root_1();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_1, n()));
			$.append($$anchor, p_1);
		};

		$.each(div_2, 21, () => numbers, $.index, ($$anchor, n) => {
			x($$anchor, () => $.get(n));
		});

		$.reset(div_2);
	}

	$.reset(div);
	$.delegated('click', button, () => numbers.push(numbers.length + 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
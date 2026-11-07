import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>a</button> <button>b</button> <div> </div> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	let double = $.state(void 0);

	function setDerived() {
		const d = $.derived(() => $.get(count) * 2);

		$.set(
			double,
			{
				get v() {
					return $.get(d);
				}
			},
			true
		);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var div = $.sibling(button_1, 2);
	var text = $.only_child(div, true);
	var node = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, `double: ${$.get(double).v ?? ''}`));
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get(double) && $.get(count) % 5) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, increment);
	$.delegated('click', button_1, setDerived);
	$.append($$anchor, fragment);
}

$.delegate(['click']);
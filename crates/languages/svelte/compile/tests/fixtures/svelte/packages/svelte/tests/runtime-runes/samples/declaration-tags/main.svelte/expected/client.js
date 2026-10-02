import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <p> </p> <div><span></span></div>`, 1);
var root_1 = $.from_html(`<button> </button> <button>toggle</button> <!> <div><span></span></div>`, 1);

export default function Main($$anchor) {
	let visible = $.state(true);
	let initial = 2;
	let top = $.state(1);
	let top_doubled = $.derived(() => $.get(top) * 2);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			let counter = $.proxy({ value: initial });
			let doubled = $.derived(() => counter.value * 2);
			const suffix = ' total';
			const format = (value) => `${value}${suffix}`;
			var fragment_1 = root();
			var button_2 = $.first_child(fragment_1);
			var text_1 = $.only_child(button_2, true);
			var p = $.sibling(button_2, 2);
			var text_2 = $.only_child(p, true);
			var div = $.sibling(p, 2);

			{
				const doubled = 'nested';
				var span = $.child(div);

				span.textContent = 'nested';
				$.reset(div);
			}

			$.template_effect(
				($0) => {
					$.set_text(text_1, counter.value);
					$.set_text(text_2, $0);
				},
				[() => format($.get(doubled))]
			);

			$.delegated('click', button_2, () => counter.value += 1);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);

	{
		const nested = 'nested';
		var span_1 = $.child(div_1);

		span_1.textContent = 'nested';
		$.reset(div_1);
	}

	$.template_effect(() => $.set_text(text, `top ${$.get(top_doubled) ?? ''}`));
	$.delegated('click', button, () => $.set(top, $.get(top) + 1));
	$.delegated('click', button_1, () => $.set(visible, !$.get(visible)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
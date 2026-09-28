import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Combobox } from "../Combobox.svelte.js";

var root = $.from_html(`<div><span> </span> <!></div>`);
var root_1 = $.from_html(`<label>Label</label> <input/> <button>Toggle</button> <div></div>`, 1);

export default function ComboboxTest($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ label: "one", value: 1 },
		{ label: "a", value: "a" },
		{ label: "obj", value: { a: 1, b: 2 } }
	];

	const combobox = new Combobox({ multiple: true });
	var fragment = root_1();
	var label = $.first_child(fragment);
	var input = $.sibling(label, 2);

	$.attribute_effect(input, () => ({ ...combobox.input }), void 0, void 0, void 0, void 0, true);

	var button = $.sibling(input, 2);

	$.attribute_effect(button, () => ({ ...combobox.trigger }));

	var div = $.sibling(button, 2);

	$.attribute_effect(div, () => ({ ...combobox.content }));

	$.each(div, 21, () => items, $.index, ($$anchor, item) => {
		var div_1 = root();

		$.attribute_effect(div_1, ($0) => ({ ...$0 }), [
			() => combobox.getOption($.get(item).value, $.get(item).label)
		]);

		var span = $.child(div_1);
		var text = $.only_child(span, true);
		var node = $.sibling(span, 2);

		{
			var consequent = ($$anchor) => {
				var text_1 = $.text('selected');

				$.append($$anchor, text_1);
			};

			var d = $.derived(() => combobox.isSelected($.get(item).value));

			$.if(node, ($$render) => {
				if ($.get(d)) $$render(consequent);
			});
		}

		$.reset(div_1);
		$.template_effect(() => $.set_text(text, $.get(item).label));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(() => $.set_attribute(label, 'for', combobox.ids.input));
	$.append($$anchor, fragment);
	$.pop();
}
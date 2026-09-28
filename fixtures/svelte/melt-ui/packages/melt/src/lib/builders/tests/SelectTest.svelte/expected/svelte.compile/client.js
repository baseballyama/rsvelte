import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select } from "../Select.svelte.js";

var root = $.from_html(`<div><span> </span> <!></div>`);
var root_1 = $.from_html(`<label>Label</label> <button><span class="truncate"> </span></button> <div></div>`, 1);

export default function SelectTest($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ label: "one", value: 1 },
		{ label: "a", value: "a" },
		{ label: "obj", value: { a: 1, b: 2 } }
	];

	const select = new Select({ multiple: true, sameWidth: false });
	var fragment = root_1();
	var label = $.first_child(fragment);
	var button = $.sibling(label, 2);

	$.attribute_effect(button, () => ({ ...select.trigger }));

	var span = $.child(button);
	var text = $.only_child(span, true);

	$.reset(button);

	var div = $.sibling(button, 2);

	$.attribute_effect(div, () => ({ ...select.content }));

	$.each(div, 21, () => items, $.index, ($$anchor, item) => {
		var div_1 = root();

		$.attribute_effect(div_1, ($0) => ({ ...$0 }), [() => select.getOption($.get(item).value, $.get(item).label)]);

		var span_1 = $.child(div_1);
		var text_1 = $.only_child(span_1, true);
		var node = $.sibling(span_1, 2);

		{
			var consequent = ($$anchor) => {
				var text_2 = $.text('selected');

				$.append($$anchor, text_2);
			};

			var d = $.derived(() => select.isSelected($.get(item).value));

			$.if(node, ($$render) => {
				if ($.get(d)) $$render(consequent);
			});
		}

		$.reset(div_1);
		$.template_effect(() => $.set_text(text_1, $.get(item).label));
		$.append($$anchor, div_1);
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(label, 'for', select.ids.trigger);
		$.set_text(text, select.valueAsString || "Select an item");
	});

	$.append($$anchor, fragment);
	$.pop();
}
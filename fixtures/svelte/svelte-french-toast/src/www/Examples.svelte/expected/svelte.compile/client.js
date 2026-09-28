import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Copy from './Copy.svelte';
import examples from './examples';

var root = $.from_html(`<label><input type="radio" name="examples" class="svelte-5alodk"/> <span class="mr-1"> </span> <span class="font-medium"> </span></label>`);
var root_1 = $.from_html(`<div><div class="overflow-auto"><pre><code class="table-cell align-middle"> </code></pre></div> <!></div>`);
var root_2 = $.from_html(`<div class="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-xl mb-5"></div> <!>`, 1);

export default function Examples($$anchor) {
	const binding_group = [];
	let selected = $.state('Success');
	var fragment = root_2();
	var div = $.first_child(fragment);

	$.each(div, 21, () => examples, (example) => example.title, ($$anchor, example) => {
		var label = root();
		let classes;
		var input = $.child(label);

		$.remove_input_defaults(input);

		var input_value;
		var span = $.sibling(input, 2);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(label);

		$.template_effect(() => {
			$.set_attribute(label, 'for', $.get(example).title);
			classes = $.set_class(label, 1, 'cursor-pointer p-2 bg-gray-100 hover:border-blue-500 rounded-xl transition-colors border-2 border-transparent svelte-5alodk', null, classes, { '_sft-checked': $.get(example).title === $.get(selected) });
			$.set_attribute(input, 'id', $.get(example).title);

			if (input_value !== (input_value = $.get(example).title)) {
				input.value = (input.__value = input_value) ?? '';
			}

			$.set_text(text, $.get(example).emoji);
			$.set_text(text_1, $.get(example).title);
		});

		$.delegated('change', input, () => {
			$.get(example).action();
		});

		$.bind_group(
			binding_group,
			[],
			input,
			() => {
				$.get(example).title;

				return $.get(selected);
			},
			($$value) => $.set(selected, $$value)
		);

		$.append($$anchor, label);
	});

	$.reset(div);

	var node = $.sibling(div, 2);

	$.each(node, 17, () => examples, $.index, ($$anchor, example) => {
		var div_1 = root_1();
		let classes_1;
		var div_2 = $.child(div_1);
		var pre = $.child(div_2);
		var code = $.child(pre);
		var text_2 = $.only_child(code, true);

		$.reset(pre);
		$.reset(div_2);

		var node_1 = $.sibling(div_2, 2);

		Copy(node_1, {
			get text() {
				return $.get(example).snippet;
			}
		});

		$.reset(div_1);

		$.template_effect(() => {
			classes_1 = $.set_class(div_1, 1, '', null, classes_1, { hidden: $.get(example).title !== $.get(selected) });
			$.set_class(pre, 1, `language-${$.get(example).html ? 'svelte' : 'javascript'} h-80 table w-full`);
			$.set_text(text_2, $.get(example).snippet);
		});

		$.append($$anchor, div_1);
	});

	$.append($$anchor, fragment);
}

$.delegate(['change']);
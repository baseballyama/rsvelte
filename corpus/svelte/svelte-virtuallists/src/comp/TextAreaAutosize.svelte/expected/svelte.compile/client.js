import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-1taaexb"><pre aria-hidden="true" class="svelte-1taaexb"> </pre> <textarea readonly="" style="outline: none;" class="svelte-1taaexb"></textarea></div>`);

export default function TextAreaAutosize($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 7, ''),
		minRows = $.prop($$props, 'minRows', 3, 1),
		maxRows = $.prop($$props, 'maxRows', 3, 40);

	const splitLines = (str) => str.split(/\r?\n/);

	function stripLines(value, max) {
		const array = splitLines(value);

		array.length = max;

		const text = array.reduce(function (previousValue, currentValue) {
			return previousValue + '\n' + currentValue;
		});

		return text;
	}

	$.user_effect(() => {
		value(stripLines(value(), maxRows()));
	});

	let minHeight = $.derived(() => `${1 + minRows() * 1.2}em`);
	let maxHeight = $.derived(() => maxRows() ? `${1 + maxRows() * 1.2}em` : `auto`);
	var div = root();
	var pre = $.child(div);
	var text_1 = $.only_child(pre, true);
	var textarea = $.sibling(pre, 2);

	$.remove_textarea_child(textarea);
	$.reset(div);

	$.template_effect(() => {
		$.set_style(pre, `min-height: ${$.get(minHeight) ?? ''}; max-height: ${$.get(maxHeight) ?? ''}`);
		$.set_text(text_1, value() + '\n');
	});

	$.bind_value(textarea, value);
	$.append($$anchor, div);
	$.pop();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="range" class="svelte-1fbbxg7"/> <input class="svelte-1fbbxg7"/> <p> </p> <div class="svelte-1fbbxg7"><span class="svelte-1fbbxg7"> </span></div>`, 1);

export default function Dimensions_input($$anchor) {
	let w;
	let h;
	let size = 42;
	let text = 'edit me';
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var p = $.sibling(input_1, 2);
	var text_1 = $.only_child(p);
	var div = $.sibling(p, 2);
	var span = $.child(div);
	var text_2 = $.only_child(span, true);

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_1, `size: ${w ?? ''}px x ${h ?? ''}px`);
		$.set_style(span, `font-size: ${size ?? ''}px`);
		$.set_text(text_2, text);
	});

	$.bind_value(input, () => size, ($$value) => size = $$value);
	$.bind_value(input_1, () => text, ($$value) => text = $$value);
	$.bind_element_size(div, 'clientWidth', ($$value) => w = $$value);
	$.bind_element_size(div, 'clientHeight', ($$value) => h = $$value);
	$.append($$anchor, fragment);
}
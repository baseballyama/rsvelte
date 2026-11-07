import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { preferences } from './preferences.svelte';

var root = $.from_html(`<div class="reading-size"><label for="text-size"><span>Reading size</span></label> <div class="slider svelte-7mfisf"><span> </span> <input type="range" name="text-size" id="text-size" min="16" max="24" step="2" class="svelte-7mfisf"/></div></div> <div class="reading-length"><label for="text-length"><span>Reading length</span></label> <div class="slider svelte-7mfisf"><span> </span> <input type="range" name="text-length" id="text-length" min="60" max="100" step="10" class="svelte-7mfisf"/></div></div> <div class="reading-height"><label for="text-height"><span>Reading line height</span></label> <div class="slider svelte-7mfisf"><span> </span> <input type="range" name="text-height" id="text-height" min="32" max="48" step="8" class="svelte-7mfisf"/></div></div>`, 1);

export default function Reading($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var span = $.child(div_1);
	var text = $.only_child(span);
	var input = $.sibling(span, 2);

	$.remove_input_defaults(input);
	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var div_3 = $.sibling($.child(div_2), 2);
	var span_1 = $.child(div_3);
	var text_1 = $.only_child(span_1);
	var input_1 = $.sibling(span_1, 2);

	$.remove_input_defaults(input_1);
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.sibling($.child(div_4), 2);
	var span_2 = $.child(div_5);
	var text_2 = $.only_child(span_2);
	var input_2 = $.sibling(span_2, 2);

	$.remove_input_defaults(input_2);
	$.reset(div_5);
	$.reset(div_4);

	$.template_effect(() => {
		$.set_text(text, `${preferences.textSize ?? ''}px`);
		$.set_text(text_1, `${preferences.textLength ?? ''}ch`);
		$.set_text(text_2, `${preferences.textHeight ?? ''}px`);
	});

	$.bind_value(input, () => preferences.textSize, ($$value) => preferences.textSize = $$value);
	$.bind_value(input_1, () => preferences.textLength, ($$value) => preferences.textLength = $$value);
	$.bind_value(input_2, () => preferences.textHeight, ($$value) => preferences.textHeight = $$value);
	$.append($$anchor, fragment);
	$.pop();
}
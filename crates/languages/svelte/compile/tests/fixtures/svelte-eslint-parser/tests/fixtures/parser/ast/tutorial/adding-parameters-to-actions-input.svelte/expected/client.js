import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { longpress } from './longpress.js';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<label><input type="range"/> </label> <button>press and hold</button> <!>`, 1);

export default function Adding_parameters_to_actions_input($$anchor) {
	let pressed = false;
	let duration = 2000;
	var fragment = root_1();
	var label = $.first_child(fragment);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'max', 2000);
	$.set_attribute(input, 'step', 100);

	var text = $.sibling(input);

	$.reset(label);

	var button = $.sibling(label, 2);

	$.action(button, ($$node, $$action_arg) => longpress?.($$node, $$action_arg), () => duration);
	$.effect(() => $.event('longpress', button, () => pressed = true));
	$.effect(() => $.event('mouseenter', button, () => pressed = false));

	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p);

			$.template_effect(() => $.set_text(text_1, `congratulations, you pressed and held for ${duration ?? ''}ms`));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (pressed) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, ` ${duration ?? ''}ms`));
	$.bind_value(input, () => duration, ($$value) => duration = $$value);
	$.append($$anchor, fragment);
}
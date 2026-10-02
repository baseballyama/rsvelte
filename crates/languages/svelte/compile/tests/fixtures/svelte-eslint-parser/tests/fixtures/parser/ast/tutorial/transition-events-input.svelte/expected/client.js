import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fly } from 'svelte/transition';

var root = $.from_html(`<p>Flies in and out</p>`);
var root_1 = $.from_html(`<p> </p> <label><input type="checkbox"/> visible</label> <!>`, 1);

export default function Transition_events_input($$anchor) {
	let visible = true;
	let status = 'waiting...';
	var fragment = root_1();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var label = $.sibling(p, 2);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var node = $.sibling(label, 2);

	{
		var consequent = ($$anchor) => {
			var p_1 = root();

			$.transition(3, p_1, () => fly, () => ({ y: 200, duration: 2000 }));
			$.event('introstart', p_1, () => status = 'intro started');
			$.event('outrostart', p_1, () => status = 'outro started');
			$.event('introend', p_1, () => status = 'intro ended');
			$.event('outroend', p_1, () => status = 'outro ended');
			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, `status: ${status ?? ''}`));
	$.bind_checked(input, () => visible, ($$value) => visible = $$value);
	$.append($$anchor, fragment);
}
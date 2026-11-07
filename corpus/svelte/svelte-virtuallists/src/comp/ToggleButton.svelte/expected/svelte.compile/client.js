import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button class="svelte-1jvvy8z"><span style="display: none;"> </span></button>`);

export default function ToggleButton($$anchor, $$props) {
	$.push($$props, true);

	let pressed = $.prop($$props, 'pressed', 15);

	function clicked() {
		pressed(!pressed());
		$$props.onclick?.();
	}

	var button = root();
	var span = $.child(button);
	var text = $.only_child(span, true);

	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-pressed', pressed() ? 'true' : 'false');
		$.set_text(text, $$props.label);
	});

	$.delegated('click', button, clicked);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <button>set bindings to 5</button> <button>set bindings to undefined</button>`, 1);

export default function Inner($$anchor, $$props) {
	$.push($$props, true);

	let readonlyWithDefault = $.prop($$props, 'readonlyWithDefault', 3, 1),
		binding = $.prop($$props, 'binding', 15);

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var button = $.sibling(p, 2);
	var button_1 = $.sibling(button, 2);

	$.template_effect(() => $.set_text(text, `readonly: ${$$props.readonly ?? ''}
	readonlyWithDefault: ${readonlyWithDefault() ?? ''}
	binding: ${binding() ?? ''}`));

	$.event('click', button, () => {
		binding(5);
	});

	$.event('click', button_1, () => {
		binding(undefined);
	});

	$.append($$anchor, fragment);
	$.pop();
}
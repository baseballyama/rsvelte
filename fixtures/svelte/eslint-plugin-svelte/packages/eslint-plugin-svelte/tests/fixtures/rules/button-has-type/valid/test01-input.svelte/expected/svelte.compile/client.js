import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from './my-button';

var root = $.from_html(`<button type="button">Hello World</button> <button type="submit">Hello World</button> <button type="reset">Hello World</button> <button>Hello World</button> <!>`, 1);

export default function Test01_input($$anchor) {
	let buttonType = 'button';
	var fragment = root();
	var button = $.sibling($.first_child(fragment), 6);

	$.set_attribute(button, 'type', buttonType);

	var node = $.sibling(button, 2);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Hello World');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
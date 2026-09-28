import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingLabelInput, Helper } from "flowbite-svelte";

var root = $.from_html(`Remember, contributions to this topic should follow our <a href="/" class="text-primary-600 dark:text-primary-500 hover:underline">Community Guidelines</a> .`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function HelperText($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	FloatingLabelInput(node, {
		variant: 'filled',
		id: 'floating_helper',
		'aria-describedby': 'floating_helper_text',
		name: 'floating_helper',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Floating helper');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Helper(node_1, {
		class: 'pt-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
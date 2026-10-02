import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GenericPopout from './GenericPopout.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Nested_props4_input($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	GenericPopout(node, {
		get x() {
			return $$props.wrapper.position.x;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Test');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	GenericPopout(node_1, {
		get position() {
			return $$props.wrapper.position;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Test');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}
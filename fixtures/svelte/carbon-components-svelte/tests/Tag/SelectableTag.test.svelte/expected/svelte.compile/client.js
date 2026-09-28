import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SelectableTag from "carbon-components-svelte/Tag/SelectableTag.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function SelectableTag_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	SelectableTag(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	SelectableTag(node_1, {
		selected: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Preselected');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	SelectableTag(node_2, {
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Disabled');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
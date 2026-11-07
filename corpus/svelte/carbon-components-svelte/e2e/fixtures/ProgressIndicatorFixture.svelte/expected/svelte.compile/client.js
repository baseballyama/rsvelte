import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ProgressIndicator, ProgressStep } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div data-testid="current-index"><!></div>`);

export default function ProgressIndicatorFixture($$anchor) {
	let currentIndex = 0;
	var div = root_1();
	var node = $.child(div);

	ProgressIndicator(node, {
		'data-testid': 'progress-indicator',
		get currentIndex() {
			return currentIndex;
		},

		set currentIndex($$value) {
			currentIndex = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			ProgressStep(node_1, { label: 'First step', description: 'Step 1', complete: true });

			var node_2 = $.sibling(node_1, 2);

			ProgressStep(node_2, { label: 'Second step', description: 'Step 2', complete: true });

			var node_3 = $.sibling(node_2, 2);

			ProgressStep(node_3, { label: 'Third step', description: 'Step 3', complete: true });

			var node_4 = $.sibling(node_3, 2);

			ProgressStep(node_4, { label: 'Fourth step', description: 'Step 4', complete: true });
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.template_effect(() => $.set_attribute(div, 'data-current', currentIndex));
	$.append($$anchor, div);
}
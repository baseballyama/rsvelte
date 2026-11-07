import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconIndicator from "carbon-components-svelte/IconIndicator/IconIndicator.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function IconIndicator_test($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	IconIndicator(node, { kind: 'failed', label: 'failed' });

	var node_1 = $.sibling(node, 2);

	IconIndicator(node_1, { kind: 'caution-major', label: 'caution-major' });

	var node_2 = $.sibling(node_1, 2);

	IconIndicator(node_2, { kind: 'caution-minor', label: 'caution-minor' });

	var node_3 = $.sibling(node_2, 2);

	IconIndicator(node_3, { kind: 'undefined', label: 'undefined' });

	var node_4 = $.sibling(node_3, 2);

	IconIndicator(node_4, { kind: 'succeeded', label: 'succeeded' });

	var node_5 = $.sibling(node_4, 2);

	IconIndicator(node_5, { kind: 'normal', label: 'normal' });

	var node_6 = $.sibling(node_5, 2);

	IconIndicator(node_6, { kind: 'in-progress', label: 'in-progress' });

	var node_7 = $.sibling(node_6, 2);

	IconIndicator(node_7, { kind: 'incomplete', label: 'incomplete' });

	var node_8 = $.sibling(node_7, 2);

	IconIndicator(node_8, { kind: 'not-started', label: 'not-started' });

	var node_9 = $.sibling(node_8, 2);

	IconIndicator(node_9, { kind: 'pending', label: 'pending' });

	var node_10 = $.sibling(node_9, 2);

	IconIndicator(node_10, { kind: 'unknown', label: 'unknown' });

	var node_11 = $.sibling(node_10, 2);

	IconIndicator(node_11, { kind: 'informative', label: 'informative' });

	var node_12 = $.sibling(node_11, 2);

	IconIndicator(node_12, { kind: 'failed', label: 'size 20', size: 20 });

	var node_13 = $.sibling(node_12, 2);

	IconIndicator(node_13, {
		kind: 'failed',
		label: 'custom attrs',
		class: 'custom-class',
		'data-testid': 'attr-test'
	});

	var node_14 = $.sibling(node_13, 2);

	IconIndicator(node_14, {
		kind: 'failed',
		label: 'Default label',
		'data-testid': 'label-children-test',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});

	$.append($$anchor, fragment);
}
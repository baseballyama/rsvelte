import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ShapeIndicator from "carbon-components-svelte/ShapeIndicator/ShapeIndicator.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function ShapeIndicator_test($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	ShapeIndicator(node, { kind: 'failed', label: 'failed' });

	var node_1 = $.sibling(node, 2);

	ShapeIndicator(node_1, { kind: 'critical', label: 'critical' });

	var node_2 = $.sibling(node_1, 2);

	ShapeIndicator(node_2, { kind: 'high', label: 'high' });

	var node_3 = $.sibling(node_2, 2);

	ShapeIndicator(node_3, { kind: 'medium', label: 'medium' });

	var node_4 = $.sibling(node_3, 2);

	ShapeIndicator(node_4, { kind: 'low', label: 'low' });

	var node_5 = $.sibling(node_4, 2);

	ShapeIndicator(node_5, { kind: 'cautious', label: 'cautious' });

	var node_6 = $.sibling(node_5, 2);

	ShapeIndicator(node_6, { kind: 'undefined', label: 'undefined' });

	var node_7 = $.sibling(node_6, 2);

	ShapeIndicator(node_7, { kind: 'stable', label: 'stable' });

	var node_8 = $.sibling(node_7, 2);

	ShapeIndicator(node_8, { kind: 'informative', label: 'informative' });

	var node_9 = $.sibling(node_8, 2);

	ShapeIndicator(node_9, { kind: 'incomplete', label: 'incomplete' });

	var node_10 = $.sibling(node_9, 2);

	ShapeIndicator(node_10, { kind: 'draft', label: 'draft' });

	var node_11 = $.sibling(node_10, 2);

	ShapeIndicator(node_11, { kind: 'failed', label: 'text size 14', textSize: 14 });

	var node_12 = $.sibling(node_11, 2);

	ShapeIndicator(node_12, {
		kind: 'failed',
		label: 'custom attrs',
		class: 'custom-class',
		'data-testid': 'attr-test'
	});

	var node_13 = $.sibling(node_12, 2);

	ShapeIndicator(node_13, {
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
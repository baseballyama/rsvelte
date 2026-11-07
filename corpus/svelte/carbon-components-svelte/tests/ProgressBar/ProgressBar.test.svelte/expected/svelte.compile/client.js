import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ProgressBar from "carbon-components-svelte/ProgressBar/ProgressBar.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function ProgressBar_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	ProgressBar(node, { status: 'active', 'data-testid': 'indeterminate-progress' });

	var node_1 = $.sibling(node, 2);

	ProgressBar(node_1, { helperText: 'Loading...' });

	var node_2 = $.sibling(node_1, 2);

	ProgressBar(node_2, {
		value: 40,
		max: 100,
		labelText: 'Progress 40%',
		'data-testid': 'progress-40%'
	});

	var node_3 = $.sibling(node_2, 2);

	ProgressBar(node_3, { size: 'sm', value: 60, 'data-testid': 'small-progress' });

	var node_4 = $.sibling(node_3, 2);

	ProgressBar(node_4, { size: 'md', value: 60, 'data-testid': 'medium-progress' });

	var node_5 = $.sibling(node_4, 2);

	ProgressBar(node_5, { kind: 'inline', value: 40, 'data-testid': 'inline-progress' });

	var node_6 = $.sibling(node_5, 2);

	ProgressBar(node_6, {
		kind: 'indented',
		value: 40,
		'data-testid': 'indented-progress'
	});

	var node_7 = $.sibling(node_6, 2);

	ProgressBar(node_7, { status: 'error', value: 40, 'data-testid': 'error-progress' });

	var node_8 = $.sibling(node_7, 2);

	ProgressBar(node_8, {
		status: 'finished',
		value: 100,
		'data-testid': 'finished-progress'
	});

	var node_9 = $.sibling(node_8, 2);

	ProgressBar(node_9, { labelText: 'Hidden label', hideLabel: true, value: 50 });

	var node_10 = $.sibling(node_9, 2);

	ProgressBar(node_10, { value: 150, max: 100, 'data-testid': 'over-max' });

	var node_11 = $.sibling(node_10, 2);

	ProgressBar(node_11, { value: -10, 'data-testid': 'under-zero' });
	$.append($$anchor, fragment);
}
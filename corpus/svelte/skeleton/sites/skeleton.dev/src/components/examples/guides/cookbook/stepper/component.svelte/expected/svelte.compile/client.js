import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ExampleStepOne from './step-one.svelte';

export default function Component($$anchor) {
	// Source Data
	const steps = [{ component: ExampleStepOne, props: { label: 'Step 1' } }

	// ...
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => steps, (step) => step, ($$anchor, step) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => step.component, ($$anchor, step_component) => {
			step_component($$anchor, $.spread_props(() => step.props));
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}
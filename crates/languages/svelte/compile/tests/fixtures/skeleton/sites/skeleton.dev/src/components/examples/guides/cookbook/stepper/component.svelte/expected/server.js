import * as $ from 'svelte/internal/server';
import ExampleStepOne from './step-one.svelte';

export default function Component($$renderer) {
	// Source Data
	const steps = [{ component: ExampleStepOne, props: { label: 'Step 1' } }

	// ...
	];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(steps);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let step = each_array[$$index];

		if (step.component) {
			$$renderer.push('<!--[-->');
			step.component($$renderer, $.spread_props([step.props]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(`<!--]-->`);
}
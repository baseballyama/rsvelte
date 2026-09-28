import * as $ from 'svelte/internal/server';
import ProgressBar from "carbon-components-svelte/ProgressBar/ProgressBar.svelte";

export default function ProgressBar_test($$renderer) {
	ProgressBar($$renderer, { status: 'active', 'data-testid': 'indeterminate-progress' });
	$$renderer.push(`<!----> `);
	ProgressBar($$renderer, { helperText: 'Loading...' });
	$$renderer.push(`<!----> `);

	ProgressBar($$renderer, {
		value: 40,
		max: 100,
		labelText: 'Progress 40%',
		'data-testid': 'progress-40%'
	});

	$$renderer.push(`<!----> `);
	ProgressBar($$renderer, { size: 'sm', value: 60, 'data-testid': 'small-progress' });
	$$renderer.push(`<!----> `);
	ProgressBar($$renderer, { size: 'md', value: 60, 'data-testid': 'medium-progress' });
	$$renderer.push(`<!----> `);
	ProgressBar($$renderer, { kind: 'inline', value: 40, 'data-testid': 'inline-progress' });
	$$renderer.push(`<!----> `);

	ProgressBar($$renderer, {
		kind: 'indented',
		value: 40,
		'data-testid': 'indented-progress'
	});

	$$renderer.push(`<!----> `);
	ProgressBar($$renderer, { status: 'error', value: 40, 'data-testid': 'error-progress' });
	$$renderer.push(`<!----> `);

	ProgressBar($$renderer, {
		status: 'finished',
		value: 100,
		'data-testid': 'finished-progress'
	});

	$$renderer.push(`<!----> `);
	ProgressBar($$renderer, { labelText: 'Hidden label', hideLabel: true, value: 50 });
	$$renderer.push(`<!----> `);
	ProgressBar($$renderer, { value: 150, max: 100, 'data-testid': 'over-max' });
	$$renderer.push(`<!----> `);
	ProgressBar($$renderer, { value: -10, 'data-testid': 'under-zero' });
	$$renderer.push(`<!---->`);
}
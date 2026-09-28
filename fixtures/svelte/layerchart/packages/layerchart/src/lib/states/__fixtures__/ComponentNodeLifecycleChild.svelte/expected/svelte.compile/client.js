import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';

var root = $.from_html(`<div data-testid="component-node-lifecycle-child"></div>`);

export default function ComponentNodeLifecycleChild($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();

	ctx.registerComponent({
		name: 'ComponentNodeLifecycleChild',
		kind: 'mark',
		markInfo: () => ({ y: 'other' })
	});

	var div = root();

	$.append($$anchor, div);
	$.pop();
}
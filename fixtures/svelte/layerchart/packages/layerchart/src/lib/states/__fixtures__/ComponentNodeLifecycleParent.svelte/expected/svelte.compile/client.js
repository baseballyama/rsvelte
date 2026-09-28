import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';

export default function ComponentNodeLifecycleParent($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();
	const node = ctx.registerComponent({ name: 'ComponentNodeLifecycleParent', kind: 'group' });

	$.user_effect(() => {
		$$props.onparentnode?.(node);
	});

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}
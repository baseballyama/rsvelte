import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Point($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({ x: ctx.xGet($$props.d), y: ctx.yGet($$props.d) }));

		$.snippet(node, () => $$props.children ?? $.noop, () => $.get($0));
	}

	$.append($$anchor, fragment);
	$.pop();
}
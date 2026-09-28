import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { asAny } from '$lib/utils/types.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { createPattern } from '$lib/utils/canvas.js';
import { createId } from '$lib/utils/createId.js';
import { buildPatternShapes } from './Pattern.shared.svelte.js';

export default function Pattern_canvas($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	const chartCtx = getChartContext();

	let id = $.prop($$props, 'id', 19, () => createId('pattern-', uid)),
		size = $.prop($$props, 'size', 3, 4),
		width = $.prop($$props, 'width', 19, size),
		height = $.prop($$props, 'height', 19, size);

	const shapes = $.derived(() => buildPatternShapes($$props.lines, $$props.circles, size(), width(), height(), $$props.rects));
	let canvasPattern = $.state(null);

	function render(_ctx) {
		const pattern = createPattern(_ctx, width(), height(), $.get(shapes), $$props.background);

		$.set(canvasPattern, pattern, true);
	}

	chartCtx.registerComponent({
		name: 'Pattern',
		kind: 'group',
		canvasRender: {
			render,
			deps: () => [width(), height(), $.get(shapes), $$props.background]
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({ id: id(), pattern: asAny($.get(canvasPattern)) }));

		$.snippet(node, () => $$props.children ?? $.noop, () => $.get($0));
	}

	$.append($$anchor, fragment);
	$.pop();
}
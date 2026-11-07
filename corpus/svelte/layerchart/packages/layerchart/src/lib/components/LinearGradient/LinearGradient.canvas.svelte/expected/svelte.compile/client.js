import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { asAny } from '$lib/utils/types.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { createLinearGradient, getComputedStyles } from '$lib/utils/canvas.js';
import { parsePercent } from '$lib/utils/math.js';
import { createId } from '$lib/utils/createId.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'stops',
	'vertical',
	'x1',
	'y1',
	'x2',
	'y2',
	'class',
	'children'
]);

export default function LinearGradient_canvas($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('linearGradient-', uid)),
		stops = $.prop($$props, 'stops', 19, () => ['var(--tw-gradient-from)', 'var(--tw-gradient-to)']),
		vertical = $.prop($$props, 'vertical', 3, false),
		x1 = $.prop($$props, 'x1', 3, '0%'),
		y1 = $.prop($$props, 'y1', 3, '0%'),
		x2 = $.prop($$props, 'x2', 19, () => vertical() ? '0%' : '100%'),
		y2 = $.prop($$props, 'y2', 19, () => vertical() ? '100%' : '0%'),
		rest = $.rest_props($$props, rest_excludes);

	const ctx = getChartContext();
	let canvasGradient = $.state(void 0);

	function render(_ctx) {
		const _stops = stops().map((stop, i) => {
			if (Array.isArray(stop)) {
				const { fill } = getComputedStyles(_ctx.canvas, { styles: { fill: stop[1] }, classes: $$props.class });

				return { offset: parsePercent(stop[0]), color: fill };
			} else {
				const { fill } = getComputedStyles(_ctx.canvas, { styles: { fill: stop }, classes: $$props.class });

				return { offset: i / (stops().length - 1), color: fill };
			}
		});

		// TODO: Use x1/y1/x2/y2 values (convert from percentage strings)
		const gradient = createLinearGradient(_ctx, ctx.padding.left, ctx.padding.top, vertical() ? ctx.padding.left : ctx.width - ctx.padding.right, vertical() ? ctx.height + ctx.padding.bottom : ctx.padding.top, _stops);

		$.set(canvasGradient, gradient, true);
	}

	ctx.registerComponent({
		name: 'Gradient',
		kind: 'group',
		canvasRender: {
			render,
			deps: () => [x1(), y1(), x2(), y2(), stops(), $$props.class]
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({ id: id(), gradient: asAny($.get(canvasGradient)) }));

		$.snippet(node, () => $$props.children ?? $.noop, () => $.get($0));
	}

	$.append($$anchor, fragment);
	$.pop();
}
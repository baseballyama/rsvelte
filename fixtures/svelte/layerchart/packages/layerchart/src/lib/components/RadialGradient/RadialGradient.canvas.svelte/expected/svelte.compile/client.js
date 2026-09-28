import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';
import { getComputedStyles } from '$lib/utils/canvas.js';
import { parsePercent } from '$lib/utils/math.js';
import { createId } from '$lib/utils/createId.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'stops',
	'cx',
	'cy',
	'fx',
	'fy',
	'children',
	'class'
]);

export default function RadialGradient_canvas($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('radialGradient-', uid)),
		stops = $.prop($$props, 'stops', 19, () => ['var(--tw-gradient-from)', 'var(--tw-gradient-to)']),
		cx = $.prop($$props, 'cx', 3, '50%'),
		cy = $.prop($$props, 'cy', 3, '50%'),
		fx = $.prop($$props, 'fx', 19, cx),
		fy = $.prop($$props, 'fy', 19, cy),
		rest = $.rest_props($$props, rest_excludes);

	const ctx = getChartContext();
	let canvasGradient = $.state(void 0);

	function render(_ctx) {
		// TODO: Set correct values: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient.
		// TODO: Memoize `createRadialGradient()` (see LinearGradient)
		const gradient = _ctx.createRadialGradient(0, 0, 0, 0, 0, 0);

		// Use `getComputedStyles()` to convert each stop (if using CSS variables and/or classes) to color values
		for (let i = 0; i < stops().length; i++) {
			const stop = stops()[i];

			if (Array.isArray(stop)) {
				const { fill } = getComputedStyles(_ctx.canvas, { styles: { fill: stop[1] }, classes: $$props.class });

				gradient.addColorStop(parsePercent(stop[0]), fill);
			} else {
				const { fill } = getComputedStyles(_ctx.canvas, { styles: { fill: stop }, classes: $$props.class });

				gradient.addColorStop(i / (stops().length - 1), fill);
			}
		}

		$.set(canvasGradient, gradient, true);
	}

	ctx.registerComponent({
		name: 'Gradient',
		kind: 'group',
		canvasRender: {
			render,
			deps: () => [stops(), cx(), cy(), fx(), fy(), ctx.width, ctx.height]
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ id: id(), gradient: $.get(canvasGradient) }));
	$.append($$anchor, fragment);
	$.pop();
}